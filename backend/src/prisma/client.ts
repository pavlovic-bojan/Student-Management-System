import { PrismaClient } from '@prisma/client';

// Single PrismaClient instance for the backend app.
export const prisma = new PrismaClient();

