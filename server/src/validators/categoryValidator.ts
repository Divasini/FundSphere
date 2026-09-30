import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});
