"use server";

import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";

export async function updatePrivateMode(formData: FormData) {
  const missingEnv = getMissingEnv(["DATABASE_URL"]);
  if (missingEnv.length > 0) {
    throw new Error(`Missing environment configuration: ${missingEnv.join(", ")}.`);
  }

  const userId = await getDefaultUserId();
  const privateMode = formData.get("privateMode") === "on";
  await prisma.user.update({
    where: { id: userId },
    data: { privateMode }
  });
}
