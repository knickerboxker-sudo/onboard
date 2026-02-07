import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ratingSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Can only rate delivered orders" },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        orderId: validated.orderId,
        fromUserId: body.fromUserId,
        toUserId: validated.toUserId,
        stars: validated.stars,
        comment: validated.comment,
        tags: validated.tags || [],
      },
    });

    const allRatings = await prisma.rating.findMany({
      where: { toUserId: validated.toUserId },
    });

    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length
        : 0;

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: validated.toUserId },
    });

    if (driverProfile) {
      await prisma.driverProfile.update({
        where: { userId: validated.toUserId },
        data: { averageRating: avgRating },
      });
    }

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
