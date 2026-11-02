import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import {
  generateRazorpaySignature,
  verifyRazorpaySignature,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "create-order";

    if (action === "create-order") {
      const amountInRupees = Number(body.amount || 0);
      if (amountInRupees <= 0) {
        return NextResponse.json(
          { error: "Invalid order amount for payment initialization." },
          { status: 400 }
        );
      }

      const razorpayOrderId = `order_Rzp${Date.now()}`;
      const simulatedPaymentId = `pay_Rzp${Date.now().toString().slice(-8)}`;
      const testSignature = generateRazorpaySignature(
        razorpayOrderId,
        simulatedPaymentId
      );

      return NextResponse.json({
        razorpayOrderId,
        amount: amountInRupees * 100, // in paise
        currency: siteConfig.currency,
        keyId: siteConfig.razorpayKeyId,
        sandboxSimulation: {
          simulatedPaymentId,
          testSignature,
        },
      });
    }

    if (action === "verify") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
      const verified = verifyRazorpaySignature(
        String(razorpayOrderId || ""),
        String(razorpayPaymentId || ""),
        String(razorpaySignature || "")
      );

      if (!verified) {
        return NextResponse.json(
          { verified: false, error: "Invalid payment signature." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        verified: true,
        paymentReference: razorpayPaymentId,
      });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Payment gateway service error." },
      { status: 500 }
    );
  }
}

