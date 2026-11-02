import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { ProductVariant } from "@/types/store";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = readDb();
  const product = db.products.find((p) => p.id === id || p.slug === id);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(
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
  const index = db.products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existing = db.products[index];

  if (body.title !== undefined) existing.title = String(body.title).trim();
  if (body.description !== undefined)
    existing.description = String(body.description).trim();
  if (body.fabricAndCare !== undefined)
    existing.fabricAndCare = String(body.fabricAndCare).trim();
  if (body.price !== undefined) existing.price = Number(body.price);
  if (body.compareAtPrice !== undefined)
    existing.compareAtPrice = body.compareAtPrice
      ? Number(body.compareAtPrice)
      : undefined;
  if (body.isFeatured !== undefined)
    existing.isFeatured = Boolean(body.isFeatured);
  if (body.isActive !== undefined) existing.isActive = Boolean(body.isActive);
  if (Array.isArray(body.images) && body.images.length > 0) {
    existing.images = body.images;
  }

  if (body.categoryId) {
    const category = db.categories.find(
      (c) => c.id === body.categoryId || c.slug === body.categoryId
    );
    if (category) {
      existing.categoryId = category.id;
      existing.categoryName = category.name;
      existing.categorySlug = category.slug;
    }
  }

  if (Array.isArray(body.variants)) {
    existing.variants = body.variants.map(
      (v: Partial<ProductVariant>, idx: number) => ({
        id: v.id || `var_${Date.now()}_${idx}`,
        productId: existing.id,
        size: String(v.size || "M").toUpperCase(),
        color: String(v.color || "Charcoal"),
        colorHex: String(v.colorHex || "#36393F"),
        sku:
          v.sku ||
          `AV-${existing.slug.slice(0, 4).toUpperCase()}-${String(v.size || "M").toUpperCase()}-${idx + 1}`,
        stock: Math.max(0, Number(v.stock ?? 0)),
      })
    );
  }

  existing.updatedAt = new Date().toISOString();
  db.products[index] = existing;
  writeDb(db);

  return NextResponse.json({
    product: existing,
    message: "Product updated successfully.",
  });
}

export async function DELETE(
  _req: NextRequest,
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
  const db = readDb();
  const index = db.products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  db.products[index].isActive = false;
  db.products[index].updatedAt = new Date().toISOString();
  writeDb(db);

  return NextResponse.json({
    product: db.products[index],
    message: "Product deactivated.",
  });
}

