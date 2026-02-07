import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user || !(session.user as { id?: string }).id) {
    throw new Error("Unauthorized");
  }
  return session.user as { id: string; email: string; name?: string };
}
