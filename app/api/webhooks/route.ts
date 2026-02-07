import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    // In production, verify the Stripe webhook signature:
    // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle different event types:
    // payment_intent.succeeded - mark order payment as complete
    // payment_intent.payment_failed - notify customer
    // account.updated - driver Stripe Connect account updated

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
