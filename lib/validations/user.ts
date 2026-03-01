import { z } from 'zod';

export const profileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be under 50 characters'),
    image: z
        .string()
        .url('Please enter a valid image URL')
        .optional()
        .or(z.literal('')),
    username: z
        .string()
        .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3-30 characters long (letters, numbers, underscores)')
        .optional()
        .or(z.literal('')),
    bio: z
        .string()
        .max(500, 'Bio must be under 500 characters')
        .optional()
        .or(z.literal('')),
    cities: z
        .string()
        .optional()
        .or(z.literal('')),
    avatarSeed: z
        .string()
        .optional()
        .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
