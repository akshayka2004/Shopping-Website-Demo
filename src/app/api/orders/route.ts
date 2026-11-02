import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getSessionPayload, verifyRazorpaySignature } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { Order, OrderItem } from "@/types/store";

export async function GET(req: NextRequest) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const statusFilter = searchParams.get("status");
  const search = (searchParams.get("q") || "").trim().toLowerCase();

  const db = readDb();

  if (scope === "admin") {
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    let orders = [...db.orders];
    if (statusFilter && statusFilter !== "ALL") {
      orders = orders.filter((o) => o.fulfilmentStatus === statusFilter);
    }
    if (search) {
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerEmail.toLowerCase().includes(search) ||
          (o.paymentReference || "").toLowerCase().includes(search)
      );
    }
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ orders });
  }

  const myOrders = db.orders
    .filter(
      (o) =>
        o.userId === session.sub ||
        o.customerEmail.toLowerCase() === session.email.toLowerCase()
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return NextResponse.json({ orders: myOrders });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionPayload();
    const body = await req.json();

    const shipping = body.shippingAddress || {};
    const fullName = String(shipping.fullName || "").trim();
    const email = String(shipping.email || "")
      .trim()
      .toLowerCase();
    const phone = String(shipping.phone || "").trim();
    const addressLine1 = String(shipping.addressLine1 || "").trim();
    const addressLine2 = String(shipping.addressLine2 || "").trim();
    const city = String(shipping.city || "").trim();
    const state = String(shipping.state || "").trim();
    const postalCode = String(shipping.postalCode || "").trim();

    if (
      !fullName ||
      !email ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          error:
            "All required contact and delivery address fields must be completed.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    const db = readDb();
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of rawItems) {
      const product = db.products.find(
        (p) => p.id === reqItem.productId && p.isActive
      );
      if (!product) {
        return NextResponse.json(
          {
            error: `Product "${reqItem.title || reqItem.productId}" is no longer available.`,
          },
          { status: 400 }
        );
      }

      const variant = product.variants.find((v) => v.id === reqItem.variantId);
      if (!variant) {
        return NextResponse.json(
          {
            error: `Selected variant for "${product.title}" was not found.`,
          },
          { status: 400 }
        );
      }

      const quantity = Math.floor(Number(reqItem.quantity || 0));
      if (quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for "${product.title}".` },
          { status: 400 }
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.title}" (${variant.size} / ${variant.color}). Only ${variant.stock} available.`,
          },
          { status: 400 }
        );
      }

      const lineTotal = product.price * quantity;
      subtotal += lineTotal;

      validatedItems.push({
        id: `oi_${Date.now()}_${validatedItems.length}`,
        productId: product.id,
        productName: product.title,
        productSlug: product.slug,
        image: product.images[0] || "/images/products/heavyweight-tee.jpg",
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        unitPrice: product.price,
        quantity,
        lineTotal,
      });
    }

    const shippingFee =
      subtotal >= siteConfig.freeShippingThreshold
        ? 0
        : siteConfig.standardShippingFee;
    const totalAmount = subtotal + shippingFee;

    const paymentMethod = body.paymentMethod === "COD" ? "COD" : "RAZORPAY";
    let paymentStatus: "PAID" | "PENDING" = "PENDING";
    let paymentReference: string | undefined;
    let razorpayOrderId: string | undefined;

    if (paymentMethod === "RAZORPAY") {
      razorpayOrderId = String(body.razorpayOrderId || "");
      paymentReference = String(body.razorpayPaymentId || "");
      const signature = String(body.razorpaySignature || "");

      if (!razorpayOrderId || !paymentReference || !signature) {
        return NextResponse.json(
          {
            error:
              "Payment verification details are missing. Please complete Razorpay payment.",
          },
          { status: 400 }
        );
      }

      const isValidSignature = verifyRazorpaySignature(
        razorpayOrderId,
        paymentReference,
        signature
      );
      if (!isValidSignature) {
        return NextResponse.json(
          {
            error:
              "Payment signature verification failed. Order was not charged.",
          },
          { status: 400 }
        );
      }

      paymentStatus = "PAID";
    } else {
      paymentReference = `COD-${Date.now().toString().slice(-6)}`;
      paymentStatus = "PENDING";
    }

    // Deduct stock atomically
    for (const item of validatedItems) {
      const product = db.products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
    }

    const nextSeq = 1001 + db.orders.length;
    const orderNumber = `ORD-2026-${nextSeq}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId: session?.sub,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        postalCode,
        country: "India",
      },
      items: validatedItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentReference,
      razorpayOrderId,
      fulfilmentStatus: "CONFIRMED",
      notes: body.notes ? String(body.notes).trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    writeDb(db);

    return NextResponse.json(
      {
        order: newOrder,
        message: "Order confirmed and submitted successfully.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process order submission." },
      { status: 500 }
    );
  }
}

