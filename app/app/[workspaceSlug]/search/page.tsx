"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type PostResult = {
  id: string;
  title: string | null;
  body: string;
  postType: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  createdAt: string;
  commentCount: number;
};

type CommentResult = {
  id: string;
  body: string;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  postId: string;
  postTitle: string | null;
  createdAt: string;
};

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-100 text-inherit px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [comments, setComments] = useState<CommentResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    const res = await fetch(
      `/api/search?workspaceSlug=${workspaceSlug}&q=${encodeURIComponent(query.trim())}`
    );

    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
      setComments(data.comments);
    }
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-lg font-semibold tracking-tight mb-4">Search</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts and comments…"
            className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="text-sm px-4 py-2 bg-[#111] text-white rounded-md hover:bg-[#333] disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Search"}
          </button>
        </div>
      </form>

      {searched && (
        <div>
          {posts.length === 0 && comments.length === 0 ? (
            <p className="text-sm text-[#6b7280] text-center py-8">
              No results found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-6">
              {posts.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
                    Posts ({posts.length})
                  </h2>
                  <div className="space-y-1">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/app/${workspaceSlug}/post/${post.id}`}
                        className="block border border-[#e5e7eb] rounded-lg p-4 bg-white hover:bg-[#fafafa] transition-colors"
                      >
                        {post.title && (
                          <h3 className="text-sm font-medium mb-0.5">
                            {highlightText(post.title, query)}
                          </h3>
                        )}
                        <p className="text-sm text-[#6b7280] line-clamp-2">
                          {highlightText(post.body, query)}
                        </p>
                        <div className="mt-1.5 text-xs text-[#9ca3af]">
                          by {post.authorDisplayName || "Anonymous"} · {post.commentCount} comments
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {comments.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2">
                    Comments ({comments.length})
                  </h2>
                  <div className="space-y-1">
                    {comments.map((comment) => (
                      <Link
                        key={comment.id}
                        href={`/app/${workspaceSlug}/post/${comment.postId}`}
                        className="block border border-[#e5e7eb] rounded-lg p-4 bg-white hover:bg-[#fafafa] transition-colors"
                      >
                        <p className="text-sm text-[#6b7280] line-clamp-2">
                          {highlightText(comment.body, query)}
                        </p>
                        <div className="mt-1.5 text-xs text-[#9ca3af]">
                          in {comment.postTitle || "Untitled post"} · by{" "}
                          {comment.authorDisplayName || "Anonymous"}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
