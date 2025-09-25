import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

// โหลดตัวแปรแวดล้อมจาก .env / .env.local ให้แน่ใจว่า Prisma เห็น DATABASE_URL เสมอ
loadEnv();

// Ensure a single PrismaClient instance in development (HMR-safe)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;


