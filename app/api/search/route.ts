import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireMembership } from "@/lib/access";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const workspaceSlug = searchParams.get("workspaceSlug");
    const q = searchParams.get("q");

    if (!workspaceSlug || !q) {
      return NextResponse.json({ error: "workspaceSlug and q required" }, { status: 400 });
    }

    const { workspace } = await requireMembership(user.id, workspaceSlug);

    // Search posts (SQLite LIKE is case-insensitive for ASCII)
    const posts = await prisma.post.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { title: { contains: q } },
          { body: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true } } },
    });

    // Also search comments
    const comments = await prisma.comment.findMany({
      where: {
        workspaceId: workspace.id,
        body: { contains: q },
      },
      orderBy: { createdAt: "desc" },
      include: { post: { select: { id: true, title: true } } },
    });

    const sanitizedPosts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      postType: p.postType,
      isAnonymous: p.isAnonymous,
      authorDisplayName: p.isAnonymous ? "Anonymous" : p.authorDisplayName,
      authorId: p.isAnonymous ? null : p.authorId,
      createdAt: p.createdAt,
      commentCount: p._count.comments,
    }));

    const sanitizedComments = comments.map((c) => ({
      id: c.id,
      body: c.body,
      isAnonymous: c.isAnonymous,
      authorDisplayName: c.isAnonymous ? "Anonymous" : c.authorDisplayName,
      postId: c.post.id,
      postTitle: c.post.title,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ posts: sanitizedPosts, comments: sanitizedComments, query: q });
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
