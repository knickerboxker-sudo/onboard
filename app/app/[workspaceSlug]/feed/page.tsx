"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Post = {
  id: string;
  title: string | null;
  body: string;
  postType: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  authorId: string | null;
  createdAt: string;
  commentCount: number;
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

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Create post state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [postType, setPostType] = useState<"UPDATE" | "QUESTION">("UPDATE");
  const [creating, setCreating] = useState(false);

  const fetchPosts = useCallback(async () => {
    const filterParam = filter !== "ALL" ? `&postType=${filter}` : "";
    const res = await fetch(
      `/api/posts?workspaceSlug=${workspaceSlug}${filterParam}`
    );
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
    setLoading(false);
  }, [workspaceSlug, filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceSlug,
        title: title || undefined,
        body,
        isAnonymous,
        postType,
      }),
    });

    if (res.ok) {
      setTitle("");
      setBody("");
      setIsAnonymous(false);
      setPostType("UPDATE");
      setShowCreate(false);
      fetchPosts();
    }
    setCreating(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold tracking-tight">Feed</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-sm px-4 py-1.5 bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors"
        >
          {showCreate ? "Cancel" : "New post"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="border border-[#e5e7eb] rounded-lg p-4 mb-6 bg-white space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows={4}
            className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111] resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-[#6b7280] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Post anonymously
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#6b7280] cursor-pointer">
                <input
                  type="checkbox"
                  checked={postType === "QUESTION"}
                  onChange={(e) =>
                    setPostType(e.target.checked ? "QUESTION" : "UPDATE")
                  }
                  className="rounded"
                />
                This is a question
              </label>
            </div>
            <button
              type="submit"
              disabled={creating || !body.trim()}
              className="text-sm px-4 py-1.5 bg-[#111] text-white rounded-md hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              {creating ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-1 mb-4">
        {["ALL", "UPDATE", "QUESTION"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setLoading(true);
            }}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              filter === f
                ? "bg-[#111] text-white"
                : "text-[#6b7280] hover:bg-[#f3f4f6]"
            }`}
          >
            {f === "ALL" ? "All" : f === "UPDATE" ? "Updates" : "Questions"}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-sm text-[#6b7280] text-center py-12">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-[#6b7280] text-center py-12">
          No posts yet. Be the first to share something.
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/app/${workspaceSlug}/post/${post.id}`}
              className="block border border-[#e5e7eb] rounded-lg p-4 bg-white hover:bg-[#fafafa] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-xs font-medium text-[#6b7280] shrink-0 mt-0.5">
                  {getInitials(post.authorDisplayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {post.authorDisplayName || "Anonymous"}
                    </span>
                    <span className="text-xs text-[#6b7280]">
                      {timeAgo(post.createdAt)}
                    </span>
                    {post.postType === "QUESTION" && (
                      <span className="text-xs px-1.5 py-0.5 border border-[#e5e7eb] rounded text-[#6b7280]">
                        Question
                      </span>
                    )}
                  </div>
                  {post.title && (
                    <h3 className="text-sm font-medium mb-0.5">{post.title}</h3>
                  )}
                  <p className="text-sm text-[#6b7280] line-clamp-2">
                    {post.body}
                  </p>
                  <div className="mt-2 text-xs text-[#9ca3af]">
                    {post.commentCount}{" "}
                    {post.commentCount === 1 ? "comment" : "comments"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
