import 'server-only';
import { PrismaClient } from './prisma-generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please check your .env file and ensure it contains DATABASE_URL="postgresql://..."'
    );
  }

  // PrismaNeon adapter - pass config object with connectionString
  const adapterFactory = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter: adapterFactory,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma =
  globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
