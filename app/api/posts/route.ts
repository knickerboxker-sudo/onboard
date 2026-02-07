import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requireMembership } from "@/lib/access";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createSchema = z.object({
  workspaceSlug: z.string(),
  title: z.string().optional(),
  body: z.string().min(1),
  isAnonymous: z.boolean().default(false),
  postType: z.enum(["UPDATE", "QUESTION"]).default("UPDATE"),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { workspaceSlug, title, body: postBody, isAnonymous, postType } = parsed.data;
    const { workspace } = await requireMembership(user.id, workspaceSlug);

    // Rate limit: 10 posts per minute per user
    if (!checkRateLimit(`post:${user.id}`, 10, 60000)) {
      return NextResponse.json({ error: "Too many posts. Please wait." }, { status: 429 });
    }

    const post = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        authorId: isAnonymous ? null : user.id,
        authorDisplayName: isAnonymous ? null : (user.name || user.email),
        isAnonymous,
        title: title || null,
        body: postBody,
        postType,
      },
    });

    return NextResponse.json({ postId: post.id });
  } catch (error) {
    console.error("Post creation error:", error);
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
    const workspaceSlug = searchParams.get("workspaceSlug");
    const postType = searchParams.get("postType");

    if (!workspaceSlug) {
      return NextResponse.json({ error: "workspaceSlug required" }, { status: 400 });
    }

    const { workspace } = await requireMembership(user.id, workspaceSlug);

    const where: Record<string, unknown> = { workspaceId: workspace.id };
    if (postType && (postType === "UPDATE" || postType === "QUESTION")) {
      where.postType = postType;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { comments: true } },
      },
    });

    // Sanitize: strip authorId from anonymous posts
    const sanitized = posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      postType: p.postType,
      isAnonymous: p.isAnonymous,
      authorDisplayName: p.isAnonymous ? "Anonymous" : p.authorDisplayName,
      authorId: p.isAnonymous ? null : p.authorId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      commentCount: p._count.comments,
    }));

    return NextResponse.json({ posts: sanitized });
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
