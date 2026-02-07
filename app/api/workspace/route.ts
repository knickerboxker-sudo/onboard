import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireRole, generateAccessCode } from "@/lib/access";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const workspaceSlug = searchParams.get("workspaceSlug");

    if (!workspaceSlug) {
      return NextResponse.json({ error: "workspaceSlug required" }, { status: 400 });
    }

    const { workspace } = await requireRole(user.id, workspaceSlug, "OWNER");

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        accessCode: workspace.accessCode,
      },
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        email: m.user.email,
        name: m.user.name,
        joinedAt: m.createdAt,
      })),
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((error as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

const updateSchema = z.object({
  workspaceSlug: z.string(),
  action: z.enum(["rotateCode", "updateName"]),
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { workspaceSlug, action, name } = parsed.data;
    const { workspace } = await requireRole(user.id, workspaceSlug, "OWNER");

    if (action === "rotateCode") {
      const newCode = generateAccessCode();
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { accessCode: newCode },
      });
      return NextResponse.json({ accessCode: newCode });
    }

    if (action === "updateName" && name) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { name },
      });
      return NextResponse.json({ name });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((error as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
