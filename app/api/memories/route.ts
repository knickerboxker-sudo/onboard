import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";

export async function PATCH(request: Request) {
  const userId = await getDefaultUserId();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const memory = await prisma.memoryItem.findUnique({ where: { id } });
  if (!memory || memory.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.memoryItem.update({
    where: { id },
    data: { pinned: !memory.pinned }
  });

  const memories = await prisma.memoryItem.findMany({
    where: { userId, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ memories });
}

export async function DELETE(request: Request) {
  const userId = await getDefaultUserId();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.memoryItem.deleteMany({
    where: { id, userId }
  });

  const memories = await prisma.memoryItem.findMany({
    where: { userId, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ memories });
}
