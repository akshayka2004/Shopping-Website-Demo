import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { Category } from "@/types/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const db = readDb();
  const categories = includeInactive
    ? db.categories
    : db.categories.filter((c) => c.isActive);
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const image = String(
    body.image || "/images/banners/collection-menswear.jpg"
  ).trim();

  if (!name) {
    return NextResponse.json(
      { error: "Category name is required." },
      { status: 400 }
    );
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const db = readDb();
  if (db.categories.some((c) => c.slug === slug)) {
    return NextResponse.json(
      { error: "A category with this name already exists." },
      { status: 409 }
    );
  }

  const newCategory: Category = {
    id: `cat_${Date.now()}`,
    name,
    slug,
    description:
      description || `Curated ${name} collection for contemporary wardrobes.`,
    image,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.categories.push(newCategory);
  writeDb(db);

  return NextResponse.json(
    { category: newCategory, message: "Category created successfully." },
    { status: 201 }
  );
}

export async function PUT(req: NextRequest) {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const id = String(body.id || "");
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  if (body.name !== undefined) db.categories[idx].name = String(body.name).trim();
  if (body.description !== undefined)
    db.categories[idx].description = String(body.description).trim();
  if (body.image !== undefined)
    db.categories[idx].image = String(body.image).trim();
  if (body.isActive !== undefined)
    db.categories[idx].isActive = Boolean(body.isActive);

  writeDb(db);
  return NextResponse.json({
    category: db.categories[idx],
    message: "Category updated successfully.",
  });
}

