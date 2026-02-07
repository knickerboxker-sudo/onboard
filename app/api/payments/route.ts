import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amountCents } = body;

    if (!orderId || !amountCents) {
      return NextResponse.json(
        { error: "Order ID and amount are required" },
        { status: 400 }
      );
    }

    // In production, this would create a Stripe PaymentIntent with manual capture
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amountCents,
    //   currency: 'usd',
    //   capture_method: 'manual',
    //   metadata: { orderId },
    // });

    const mockPaymentIntent = {
      id: `pi_${Date.now()}`,
      amount: amountCents,
      status: "requires_capture",
      orderId,
    };

    return NextResponse.json(mockPaymentIntent);
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
