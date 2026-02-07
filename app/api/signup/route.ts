import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateAccessCode } from "@/lib/access";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, workspaceName } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create slug from workspace name
    const baseSlug = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 40);

    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const accessCode = generateAccessCode();

    // Create user, workspace, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: emailLower, passwordHash, name: name || null },
      });

      const workspace = await tx.workspace.create({
        data: { name: workspaceName, slug, accessCode },
      });

      await tx.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: user.id, role: "OWNER" },
      });

      return { user, workspace };
    });

    return NextResponse.json({
      workspaceSlug: result.workspace.slug,
      accessCode: result.workspace.accessCode,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
