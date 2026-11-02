import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const newPassword = String(body.newPassword || "");

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your registered email address." },
        { status: 400 }
      );
    }

    const db = readDb();
    const userIndex = db.users.findIndex(
      (u) => u.email.toLowerCase() === email
    );

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "No account found with that email address." },
        { status: 404 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    db.users[userIndex].passwordHash = hashPassword(newPassword);
    writeDb(db);

    return NextResponse.json({
      message: "Your password has been updated. You can now sign in.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}

