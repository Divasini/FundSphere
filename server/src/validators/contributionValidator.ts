import { z } from 'zod';

export const createContributionSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  amount: z.coerce.number().positive('Contribution amount must be greater than 0'),
  simulateFailure: z.boolean().optional().default(false), // For testing payment failure scenario
});
