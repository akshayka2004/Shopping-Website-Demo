import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, toSafeUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";
import { Address } from "@/types/store";

export async function GET() {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const db = readDb();
  const user = db.users.find((u) => u.id === session.sub);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: toSafeUser(user) });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const db = readDb();
  const userIndex = db.users.findIndex((u) => u.id === session.sub);
  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = db.users[userIndex];

  if (body.action === "update-profile") {
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }
    user.name = name;
    user.phone = phone || undefined;
  } else if (body.action === "add-address") {
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const addressLine1 = String(body.addressLine1 || "").trim();
    const addressLine2 = String(body.addressLine2 || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const label = String(body.label || "Home").trim();
    const isDefault = Boolean(body.isDefault) || user.addresses.length === 0;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: "Please fill in all required address fields." },
        { status: 400 }
      );
    }

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      userId: user.id,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      country: "India",
      isDefault,
    };

    user.addresses.push(newAddress);
  } else if (body.action === "delete-address") {
    const addressId = String(body.addressId || "");
    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
  } else if (body.action === "set-default-address") {
    const addressId = String(body.addressId || "");
    user.addresses.forEach((a) => {
      a.isDefault = a.id === addressId;
    });
  }

  db.users[userIndex] = user;
  writeDb(db);
  return NextResponse.json({
    user: toSafeUser(user),
    message: "Account updated successfully.",
  });
}

