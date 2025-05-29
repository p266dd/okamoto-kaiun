import { PrismaClient } from "./prisma/client";

let prisma: PrismaClient | undefined;

// * Singleton Pattern.
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export default getPrismaClient();
