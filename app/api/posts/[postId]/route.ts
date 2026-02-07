import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireMembership } from "@/lib/access";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const workspaceSlug = searchParams.get("workspaceSlug");

    if (!workspaceSlug) {
      return NextResponse.json({ error: "workspaceSlug required" }, { status: 400 });
    }

    const { workspace } = await requireMembership(user.id, workspaceSlug);

    const post = await prisma.post.findFirst({
      where: { id: params.postId, workspaceId: workspace.id },
      include: {
        comments: { orderBy: { createdAt: "asc" } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        postType: post.postType,
        isAnonymous: post.isAnonymous,
        authorDisplayName: post.isAnonymous ? "Anonymous" : post.authorDisplayName,
        authorId: post.isAnonymous ? null : post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentCount: post._count.comments,
        comments: post.comments.map((c) => ({
          id: c.id,
          body: c.body,
          isAnonymous: c.isAnonymous,
          authorDisplayName: c.isAnonymous ? "Anonymous" : c.authorDisplayName,
          authorId: c.isAnonymous ? null : c.authorId,
          createdAt: c.createdAt,
        })),
      },
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
