import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  accessCode: z.string().length(5),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { accessCode, email, password, name } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Find workspace by access code
    const workspace = await prisma.workspace.findFirst({
      where: { accessCode },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Invalid access code." }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: { email: emailLower, passwordHash, name: name || null },
      });
    } else {
      // Verify password for existing user
      if (!user.passwordHash) {
        return NextResponse.json({ error: "Account exists but has no password set." }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid password for existing account." }, { status: 400 });
      }
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    });

    if (existingMember) {
      return NextResponse.json({
        workspaceSlug: workspace.slug,
        message: "Already a member.",
      });
    }

    // Add as member
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: user.id, role: "MEMBER" },
    });

    return NextResponse.json({ workspaceSlug: workspace.slug });
  } catch (error) {
    console.error("Join error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
