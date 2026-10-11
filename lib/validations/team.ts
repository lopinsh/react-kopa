import { z } from 'zod';

export const teamTargetSchema = z.object({
    userId: z.string().min(1).max(64),
});

export const teamSearchSchema = z.object({
    query: z.string().trim().min(2).max(80),
});
