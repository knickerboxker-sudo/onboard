"use server";

import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";

export async function updatePrivateMode(formData: FormData) {
  const userId = await getDefaultUserId();
  const privateMode = formData.get("privateMode") === "on";
  await prisma.user.update({
    where: { id: userId },
    data: { privateMode }
  });
}
