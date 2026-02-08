import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
const hasValidDatabaseUrl =
  typeof databaseUrl === "string" &&
  /^(postgresql|postgres):\/\//.test(databaseUrl);

export const prisma = hasValidDatabaseUrl
  ? globalForPrisma.prisma || new PrismaClient()
  : null;

if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
