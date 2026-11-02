import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@/types/store";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = readDb();
  const order = db.orders.find(
    (o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase()
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await req.json();
  const db = readDb();
  const idx = db.orders.findIndex(
    (o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase()
  );

  if (idx === -1) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = db.orders[idx];
  const prevStatus = order.fulfilmentStatus;

  const validFulfilmentStatuses: OrderStatus[] = [
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  const validPaymentStatuses: PaymentStatus[] = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];

  if (
    body.fulfilmentStatus &&
    validFulfilmentStatuses.includes(body.fulfilmentStatus)
  ) {
    order.fulfilmentStatus = body.fulfilmentStatus;

    // Restore stock if order is newly cancelled
    if (prevStatus !== "CANCELLED" && order.fulfilmentStatus === "CANCELLED") {
      for (const item of order.items) {
        const prod = db.products.find((p) => p.id === item.productId);
        const variant = prod?.variants.find((v) => v.id === item.variantId);
        if (variant) {
          variant.stock += item.quantity;
        }
      }
    }
  }

  if (
    body.paymentStatus &&
    validPaymentStatuses.includes(body.paymentStatus)
  ) {
    order.paymentStatus = body.paymentStatus;
  }

  order.updatedAt = new Date().toISOString();
  db.orders[idx] = order;
  writeDb(db);

  return NextResponse.json({
    order,
    message: `Order ${order.orderNumber} updated successfully.`,
  });
}

