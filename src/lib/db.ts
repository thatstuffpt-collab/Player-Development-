import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const prisma = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
