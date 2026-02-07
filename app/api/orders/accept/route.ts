import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDriverEarnings } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, driverId } = body;

    if (!orderId || !driverId) {
      return NextResponse.json(
        { error: "Order ID and driver ID are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "OPEN") {
        throw new Error("Order is no longer available");
      }

      const activeOrders = await tx.order.count({
        where: {
          driverId,
          status: { in: ["ACCEPTED", "PICKED_UP"] },
        },
      });

      if (activeOrders >= 3) {
        throw new Error("Maximum 3 active orders allowed");
      }

      const driverEarnings = calculateDriverEarnings(order.offerAmountCents);

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          driverId,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          driverEarningsCents: driverEarnings,
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error accepting order:", error);
    const message =
      error instanceof Error ? error.message : "Failed to accept order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
