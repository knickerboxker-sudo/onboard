import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { increaseOfferSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = increaseOfferSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only increase offer on open orders" },
        { status: 400 }
      );
    }

    if (validated.newAmountCents <= order.offerAmountCents) {
      return NextResponse.json(
        { error: "New amount must be higher than current offer" },
        { status: 400 }
      );
    }

    const increase = validated.newAmountCents - order.offerAmountCents;
    if (increase < 100) {
      return NextResponse.json(
        { error: "Minimum increase is $1.00" },
        { status: 400 }
      );
    }

    const history = Array.isArray(order.priceHistory)
      ? order.priceHistory
      : JSON.parse(order.priceHistory as string);
    history.push({
      amount: validated.newAmountCents,
      timestamp: new Date().toISOString(),
    });

    const updated = await prisma.order.update({
      where: { id: validated.orderId },
      data: {
        offerAmountCents: validated.newAmountCents,
        priceHistory: JSON.stringify(history),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error increasing offer:", error);
    return NextResponse.json(
      { error: "Failed to increase offer" },
      { status: 500 }
    );
  }
}
