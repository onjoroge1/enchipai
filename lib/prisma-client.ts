import 'server-only';

// Re-export Prisma Client and types from generated location
// NOTE: This should only be used server-side (API routes, server components)
// For client-side types, use ./prisma-types instead
export * from './prisma-generated/client';

