"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  body: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  authorId: string | null;
  createdAt: string;
};

type Post = {
  id: string;
  title: string | null;
  body: string;
  postType: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  comments: Comment[];
};

function getInitials(name: string | null): string {
  if (!name || name === "Anonymous") return "A";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PostDetailPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    const res = await fetch(
      `/api/posts/${postId}?workspaceSlug=${workspaceSlug}`
    );
    if (res.ok) {
      const data = await res.json();
      setPost(data.post);
    }
    setLoading(false);
  }, [postId, workspaceSlug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        workspaceSlug,
        body: commentBody,
        isAnonymous,
      }),
    });

    if (res.ok) {
      setCommentBody("");
      setIsAnonymous(false);
      fetchPost();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-[#6b7280]">
        Loading…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-[#6b7280]">
        Post not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href={`/app/${workspaceSlug}/feed`}
        className="text-xs text-[#6b7280] hover:text-[#111] transition-colors mb-4 inline-block"
      >
        ← Back to feed
      </Link>

      {/* Post */}
      <div className="border border-[#e5e7eb] rounded-lg p-5 bg-white mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xs font-medium text-[#6b7280]">
            {getInitials(post.authorDisplayName)}
          </div>
          <div>
            <span className="text-sm font-medium">
              {post.authorDisplayName || "Anonymous"}
            </span>
            <span className="text-xs text-[#6b7280] ml-2">
              {formatDate(post.createdAt)}
            </span>
          </div>
          {post.postType === "QUESTION" && (
            <span className="text-xs px-1.5 py-0.5 border border-[#e5e7eb] rounded text-[#6b7280] ml-auto">
              Question
            </span>
          )}
        </div>
        {post.title && (
          <h1 className="text-base font-semibold mb-2">{post.title}</h1>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
      </div>

      {/* Comments */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3">
          {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
        </h2>

        {post.comments.length === 0 ? (
          <p className="text-xs text-[#6b7280]">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-[#e5e7eb] rounded-lg p-4 bg-white"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[10px] font-medium text-[#6b7280]">
                    {getInitials(comment.authorDisplayName)}
                  </div>
                  <span className="text-xs font-medium">
                    {comment.authorDisplayName || "Anonymous"}
                  </span>
                  <span className="text-xs text-[#9ca3af]">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply */}
      <form
        onSubmit={handleComment}
        className="border border-[#e5e7eb] rounded-lg p-4 bg-white space-y-3"
      >
        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Write a reply…"
          required
          rows={3}
          className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111] resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-[#6b7280] cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            Reply anonymously
          </label>
          <button
            type="submit"
            disabled={submitting || !commentBody.trim()}
            className="text-sm px-4 py-1.5 bg-[#111] text-white rounded-md hover:bg-[#333] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Replying…" : "Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
