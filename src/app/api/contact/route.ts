import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const orderNumber = String(body.orderNumber || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, email, subject, and message." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const db = readDb();
    db.inquiries.unshift({
      id: `inq_${Date.now()}`,
      name,
      email,
      subject,
      orderNumber: orderNumber || undefined,
      message,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);

    return NextResponse.json(
      {
        message:
          "Thank you for contacting us. Our client care team will respond within 24 hours.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit inquiry." },
      { status: 500 }
    );
  }
}

