import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const memory = await prisma.memoryItem.findUnique({ where: { id } });
  if (!memory || memory.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.memoryItem.update({
    where: { id },
    data: { pinned: !memory.pinned }
  });

  const memories = await prisma.memoryItem.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ memories });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.memoryItem.deleteMany({
    where: { id, userId: session.user.id }
  });

  const memories = await prisma.memoryItem.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ memories });
}
