import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Image from "next/image";
import Link from "next/link";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

type VerificationRow = {
  id: string;
  business_id: string;
  verification_type: string;
  document_url: string | null;
  status: string;
  submitted_at: string;
  reviewer_notes: string | null;
  businesses: { name: string } | { name: string }[] | null;
};

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: verifications } = await admin
    .from("verifications")
    .select("id, business_id, verification_type, document_url, status, submitted_at, reviewer_notes, businesses(name)")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });

  const rows = (verifications ?? []) as VerificationRow[];

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)", marginBottom: "32px" }} />
      <h1
        className="mb-6"
        style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--color-ink)" }}
      >
        Verification Reviews
      </h1>

      {rows.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
          No pending verifications.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((v) => {
            const bizName = Array.isArray(v.businesses)
              ? v.businesses[0]?.name
              : (v.businesses as { name: string } | null)?.name;
            return (
              <div
                key={v.id}
                className="p-6"
                style={{
                  border: "1px solid var(--color-rule)",
                  borderRadius: "2px",
                  backgroundColor: "var(--color-paper)",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2
                      style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-ink)" }}
                    >
                      {bizName ?? "Unknown Business"}
                    </h2>
                    <p
                      className="mt-1 text-sm"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                    >
                      {v.verification_type} · Submitted {new Date(v.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/api/admin/verifications/${v.id}?action=approve`}
                      className="btn"
                      style={{ backgroundColor: "#16a34a", color: "#fff" }}
                    >
                      Approve
                    </Link>
                    <Link
                      href={`/api/admin/verifications/${v.id}?action=reject`}
                      className="btn"
                      style={{ backgroundColor: "#dc2626", color: "#fff" }}
                    >
                      Reject
                    </Link>
                  </div>
                </div>

                {v.document_url && (
                  <div className="mt-4">
                    {v.document_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image
                        src={v.document_url}
                        alt="Verification document"
                        width={400}
                        height={300}
                        className="rounded"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    ) : (
                      <Link
                        href={v.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        View document →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
