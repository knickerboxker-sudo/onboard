import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMembership } from "@/lib/access";
import { AppSidebar } from "@/components/app-sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;
  const result = await getMembership(userId, params.workspaceSlug);

  if (!result) {
    redirect("/join");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        workspaceSlug={params.workspaceSlug}
        workspaceName={result.workspace.name}
      />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
