import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireMembership } from "@/lib/access";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createSchema = z.object({
  postId: z.string(),
  workspaceSlug: z.string(),
  body: z.string().min(1),
  isAnonymous: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { postId, workspaceSlug, body: commentBody, isAnonymous } = parsed.data;
    const { workspace } = await requireMembership(user.id, workspaceSlug);

    // Verify post belongs to workspace
    const post = await prisma.post.findFirst({
      where: { id: postId, workspaceId: workspace.id },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Rate limit
    if (!checkRateLimit(`comment:${user.id}`, 20, 60000)) {
      return NextResponse.json({ error: "Too many comments. Please wait." }, { status: 429 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        workspaceId: workspace.id,
        authorId: isAnonymous ? null : user.id,
        authorDisplayName: isAnonymous ? null : (user.name || user.email),
        isAnonymous,
        body: commentBody,
      },
    });

    return NextResponse.json({ commentId: comment.id });
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

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const workspaceSlug = searchParams.get("workspaceSlug");

    if (!postId || !workspaceSlug) {
      return NextResponse.json({ error: "postId and workspaceSlug required" }, { status: 400 });
    }

    const { workspace } = await requireMembership(user.id, workspaceSlug);

    // Verify post belongs to workspace
    const post = await prisma.post.findFirst({
      where: { id: postId, workspaceId: workspace.id },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId, workspaceId: workspace.id },
      orderBy: { createdAt: "asc" },
    });

    const sanitized = comments.map((c) => ({
      id: c.id,
      body: c.body,
      isAnonymous: c.isAnonymous,
      authorDisplayName: c.isAnonymous ? "Anonymous" : c.authorDisplayName,
      authorId: c.isAnonymous ? null : c.authorId,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ comments: sanitized });
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
