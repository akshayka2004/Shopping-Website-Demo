import { NextResponse } from "next/server";
import { getSessionPayload, toSafeUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET() {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const db = readDb();

  const nonCancelledOrders = db.orders.filter(
    (o) => o.fulfilmentStatus !== "CANCELLED"
  );
  const totalRevenue = nonCancelledOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );
  const paidRevenue = db.orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalProducts = db.products.length;
  const activeProducts = db.products.filter((p) => p.isActive).length;
  const totalCategories = db.categories.length;

  let totalStockUnits = 0;
  const lowStockVariants: Array<{
    productId: string;
    productTitle: string;
    variantId: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
  }> = [];

  for (const product of db.products) {
    for (const variant of product.variants) {
      totalStockUnits += variant.stock;
      if (variant.stock <= 7) {
        lowStockVariants.push({
          productId: product.id,
          productTitle: product.title,
          variantId: variant.id,
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          stock: variant.stock,
        });
      }
    }
  }

  const statusCounts = {
    CONFIRMED: db.orders.filter((o) => o.fulfilmentStatus === "CONFIRMED")
      .length,
    PROCESSING: db.orders.filter((o) => o.fulfilmentStatus === "PROCESSING")
      .length,
    SHIPPED: db.orders.filter((o) => o.fulfilmentStatus === "SHIPPED").length,
    DELIVERED: db.orders.filter((o) => o.fulfilmentStatus === "DELIVERED")
      .length,
    CANCELLED: db.orders.filter((o) => o.fulfilmentStatus === "CANCELLED")
      .length,
  };

  const customers = db.users
    .filter((u) => u.role === "CUSTOMER")
    .map((u) => {
      const customerOrders = db.orders.filter(
        (o) =>
          o.userId === u.id ||
          o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );
      const totalSpent = customerOrders.reduce(
        (s, o) => s + (o.fulfilmentStatus !== "CANCELLED" ? o.totalAmount : 0),
        0
      );
      return {
        ...toSafeUser(u),
        orderCount: customerOrders.length,
        totalSpent,
      };
    });

  return NextResponse.json({
    metrics: {
      totalRevenue,
      paidRevenue,
      totalOrders: db.orders.length,
      totalProducts,
      activeProducts,
      totalCategories,
      totalStockUnits,
      totalCustomers: customers.length,
      lowStockCount: lowStockVariants.length,
    },
    statusCounts,
    lowStockVariants,
    recentOrders: db.orders.slice(0, 8),
    customers,
  });
}

