import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300),
  description: z.string().min(30, 'Full description must be at least 30 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  fundingGoal: z.coerce.number().positive('Funding goal must be greater than 0'),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date.getTime() > Date.now();
  }, {
    message: 'Deadline must be a valid future date',
  }),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  isDraft: z.boolean().optional().default(false),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  shortDescription: z.string().min(10).max(300).optional(),
  description: z.string().min(30).optional(),
  categoryId: z.string().min(1).optional(),
  fundingGoal: z.coerce.number().positive().optional(),
  deadline: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date.getTime() > Date.now();
  }, {
    message: 'Deadline must be a valid future date',
  }),
  coverImage: z.string().url().optional().or(z.literal('')),
});

export const campaignUpdatePostSchema = z.object({
  title: z.string().min(3, 'Update title must be at least 3 characters').max(150),
  content: z.string().min(10, 'Update content must be at least 10 characters'),
});

export const rejectCampaignSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
});
