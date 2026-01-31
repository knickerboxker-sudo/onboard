import { prisma } from "./db";

const DEFAULT_EMAIL = "demo@onboard.local";

export async function getDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_EMAIL },
    update: {},
    create: {
      email: DEFAULT_EMAIL,
      passwordHash: "disabled",
      name: "Demo User"
    }
  });
}

export async function getDefaultUserId() {
  const user = await getDefaultUser();
  return user.id;
}
