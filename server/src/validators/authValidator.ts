import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
  adminSecretCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
});
