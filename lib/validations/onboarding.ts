import { z } from 'zod';

/**
 * Zod schema for the username onboarding form.
 * Unlike the profile schema (where username is optional),
 * here it is strictly required — users MUST choose a username to proceed.
 */
export const usernameOnboardingSchema = z.object({
    username: z
        .string()
        .min(1, 'Required')
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
});

export type UsernameOnboardingValues = z.infer<typeof usernameOnboardingSchema>;
