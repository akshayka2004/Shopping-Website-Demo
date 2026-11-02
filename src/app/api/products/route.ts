import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { Product, ProductVariant } from "@/types/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const category = (searchParams.get("category") || "").trim().toLowerCase();
  const size = (searchParams.get("size") || "").trim().toUpperCase();
  const color = (searchParams.get("color") || "").trim().toLowerCase();
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const sort = searchParams.get("sort") || "featured";
  const featuredOnly = searchParams.get("featured") === "true";
  const inStockOnly = searchParams.get("inStock") === "true";
  const includeInactive = searchParams.get("includeInactive") === "true";

  const session = await getSessionPayload();
  const isAdmin = session?.role === "ADMIN";

  const db = readDb();
  let products = [...db.products];

  if (!includeInactive || !isAdmin) {
    products = products.filter((p) => p.isActive);
  }

  if (featuredOnly) {
    products = products.filter((p) => p.isFeatured);
  }

  if (category && category !== "all") {
    products = products.filter(
      (p) =>
        p.categorySlug.toLowerCase() === category ||
        p.categoryId.toLowerCase() === category
    );
  }

  if (query) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query)
    );
  }

  if (size) {
    products = products.filter((p) =>
      p.variants.some((v) => v.size.toUpperCase() === size && v.stock > 0)
    );
  }

  if (color) {
    products = products.filter((p) =>
      p.variants.some((v) => v.color.toLowerCase() === color)
    );
  }

  if (minPrice > 0) {
    products = products.filter((p) => p.price >= minPrice);
  }

  if (maxPrice > 0) {
    products = products.filter((p) => p.price <= maxPrice);
  }

  if (inStockOnly) {
    products = products.filter((p) =>
      p.variants.some((v) => v.stock > 0)
    );
  }

  if (sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    products.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sort === "name-asc") {
    products.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    products.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const fabricAndCare = String(
      body.fabricAndCare || "100% Organic Cotton. Machine wash cold."
    ).trim();
    const price = Number(body.price || 0);
    const compareAtPrice = body.compareAtPrice
      ? Number(body.compareAtPrice)
      : undefined;
    const categoryId = String(body.categoryId || "").trim();
    const images: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : ["/images/products/heavyweight-tee.jpg"];
    const isFeatured = Boolean(body.isFeatured);
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    if (!title || price <= 0 || !categoryId) {
      return NextResponse.json(
        { error: "Product title, valid price, and category are required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const category = db.categories.find(
      (c) => c.id === categoryId || c.slug === categoryId
    );
    if (!category) {
      return NextResponse.json(
        { error: "Selected category does not exist." },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = db.products.some((p) => p.slug === baseSlug)
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const productId = `prod_${Date.now()}`;
    const rawVariants = Array.isArray(body.variants) ? body.variants : [];
    const variants: ProductVariant[] =
      rawVariants.length > 0
        ? rawVariants.map((v: Partial<ProductVariant>, idx: number) => ({
            id: v.id || `var_${Date.now()}_${idx}`,
            productId,
            size: String(v.size || "M").toUpperCase(),
            color: String(v.color || "Charcoal"),
            colorHex: String(v.colorHex || "#36393F"),
            sku:
              v.sku ||
              `AV-${slug.slice(0, 4).toUpperCase()}-${String(v.size || "M").toUpperCase()}-${idx + 1}`,
            stock: Math.max(0, Number(v.stock ?? 10)),
          }))
        : [
            {
              id: `var_${Date.now()}_0`,
              productId,
              size: "M",
              color: "Charcoal",
              colorHex: "#36393F",
              sku: `AV-${slug.slice(0, 4).toUpperCase()}-M`,
              stock: 15,
            },
          ];

    const newProduct: Product = {
      id: productId,
      title,
      slug,
      description:
        description ||
        "Thoughtfully tailored contemporary garment crafted from premium natural fibres.",
      fabricAndCare,
      price,
      compareAtPrice,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      images,
      isFeatured,
      isActive,
      variants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    writeDb(db);

    return NextResponse.json(
      { product: newProduct, message: "Product created successfully." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}

