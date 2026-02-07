import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        driver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            driverProfile: {
              select: {
                averageRating: true,
                totalDeliveries: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleColor: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const order = await prisma.order.create({
      data: {
        ...validated,
        customerId: body.customerId,
        priceHistory: JSON.stringify([
          { amount: validated.offerAmountCents, timestamp: new Date().toISOString() },
        ]),
        expiresAt,
        status: "OPEN",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
