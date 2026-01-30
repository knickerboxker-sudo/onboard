import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name
    }
  });

  return NextResponse.json({ ok: true });
}
