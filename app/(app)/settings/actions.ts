"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updatePrivateMode(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return;
  }
  const privateMode = formData.get("privateMode") === "on";
  await prisma.user.update({
    where: { id: session.user.id },
    data: { privateMode }
  });
}
