import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export async function getMembership(userId: string, workspaceSlug: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
  });
  if (!workspace) return null;

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
  });
  if (!member) return null;

  return { workspace, member };
}

export async function requireMembership(userId: string, workspaceSlug: string) {
  const result = await getMembership(userId, workspaceSlug);
  if (!result) throw new Error("Forbidden");
  return result;
}

export async function requireRole(userId: string, workspaceSlug: string, role: Role) {
  const result = await requireMembership(userId, workspaceSlug);
  if (result.member.role !== role) throw new Error("Forbidden");
  return result;
}

export function generateAccessCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
