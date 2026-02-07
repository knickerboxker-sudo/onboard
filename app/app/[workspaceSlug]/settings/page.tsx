"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

type Member = {
  id: string;
  role: string;
  email: string;
  name: string | null;
  joinedAt: string;
};

type WorkspaceInfo = {
  id: string;
  name: string;
  slug: string;
  accessCode: string;
};

export default function SettingsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch(
      `/api/workspace?workspaceSlug=${workspaceSlug}`
    );
    if (res.ok) {
      const data = await res.json();
      setWorkspace(data.workspace);
      setMembers(data.members);
      setNewName(data.workspace.name);
    } else if (res.status === 403) {
      setError("Only the workspace owner can view settings.");
    }
    setLoading(false);
  }, [workspaceSlug]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleRotateCode() {
    setUpdating(true);
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, action: "rotateCode" }),
    });
    if (res.ok) {
      const data = await res.json();
      setWorkspace((prev) =>
        prev ? { ...prev, accessCode: data.accessCode } : prev
      );
    }
    setUpdating(false);
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setUpdating(true);
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, action: "updateName", name: newName }),
    });
    if (res.ok) {
      setWorkspace((prev) => (prev ? { ...prev, name: newName } : prev));
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-[#6b7280]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>

      {/* Workspace name */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Workspace name</h2>
        <form onSubmit={handleUpdateName} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
          />
          <button
            type="submit"
            disabled={updating || !newName.trim() || newName === workspace.name}
            className="text-sm px-4 py-2 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </form>
      </section>

      {/* Access code */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Access code</h2>
        <p className="text-xs text-[#6b7280] mb-2">
          Share this 5-digit code with people you want to invite.
        </p>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f3f4f6] rounded-md font-mono text-lg tracking-[0.3em]">
            {codeVisible ? workspace.accessCode : "•••••"}
          </div>
          <button
            onClick={() => setCodeVisible(!codeVisible)}
            className="text-xs text-[#6b7280] hover:text-[#111] transition-colors"
          >
            {codeVisible ? "Hide" : "Show"}
          </button>
          <button
            onClick={handleRotateCode}
            disabled={updating}
            className="text-xs px-3 py-1.5 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] disabled:opacity-50 transition-colors"
          >
            Rotate
          </button>
        </div>
      </section>

      {/* Members */}
      <section>
        <h2 className="text-sm font-semibold mb-3">
          Members ({members.length})
        </h2>
        <div className="border border-[#e5e7eb] rounded-lg bg-white divide-y divide-[#e5e7eb]">
          {members.map((member) => (
            <div key={member.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {member.name || member.email}
                </span>
                {member.name && (
                  <span className="text-xs text-[#6b7280] ml-2">
                    {member.email}
                  </span>
                )}
              </div>
              <span className="text-xs px-2 py-0.5 border border-[#e5e7eb] rounded text-[#6b7280]">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Billing stub */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Billing</h2>
        <div className="border border-[#e5e7eb] rounded-lg p-4 bg-white">
          <p className="text-xs text-[#6b7280]">
            Billing is not yet enabled. Your workspace is free during the beta period.
          </p>
        </div>
      </section>
    </div>
  );
}
