import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance across the backend.
export const prisma = new PrismaClient();
