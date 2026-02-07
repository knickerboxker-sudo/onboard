import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      workspaces: memberships.map((m) => ({
        slug: m.workspace.slug,
        name: m.workspace.name,
        role: m.role,
      })),
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
