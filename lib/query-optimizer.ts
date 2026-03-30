import { Prisma } from '@prisma/client';

/**
 * Optimize Prisma query with select to reduce data transfer
 */
export function optimizeSelect<T extends Record<string, any>>(
  fields: (keyof T)[]
): Record<string, boolean> {
  const select: Record<string, boolean> = {};
  fields.forEach((field) => {
    select[field as string] = true;
  });
  return select;
}

/**
 * Common select patterns for optimization
 */
export const commonSelects = {
  user: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
  tent: {
    id: true,
    name: true,
    slug: true,
    image: true,
    price: true,
    capacity: true,
    status: true,
    featured: true,
  },
  booking: {
    id: true,
    bookingNumber: true,
    checkIn: true,
    checkOut: true,
    totalAmount: true,
    status: true,
    createdAt: true,
  },
};

/**
 * Add pagination to query
 */
export function addPagination(
  page: number = 1,
  pageSize: number = 50
): { take: number; skip: number } {
  const skip = (page - 1) * pageSize;
  return {
    take: pageSize,
    skip: Math.max(0, skip),
  };
}

/**
 * Optimize include to only fetch needed relations
 */
export function optimizeInclude(relations: string[]): Record<string, boolean | any> {
  const include: Record<string, any> = {};
  relations.forEach((relation) => {
    include[relation] = true;
  });
  return include;
}

/**
 * Create optimized query options
 */
export interface OptimizedQueryOptions {
  select?: Record<string, boolean>;
  include?: Record<string, boolean | any>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: any;
}

export function createOptimizedQuery(options: OptimizedQueryOptions) {
  return {
    ...(options.select && { select: options.select }),
    ...(options.include && { include: options.include }),
    ...(options.take !== undefined && { take: options.take }),
    ...(options.skip !== undefined && { skip: options.skip }),
    ...(options.orderBy && { orderBy: options.orderBy }),
    ...(options.where && { where: options.where }),
  };
}

