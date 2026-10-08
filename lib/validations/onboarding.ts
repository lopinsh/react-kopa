import { z } from 'zod';

/**
 * Username (public handle) rules, shared by registration and onboarding.
 * Lowercase only, so `Oskars` and `oskars` can't be two different people.
 * Error messages are translation keys under `auth.validation`.
 */
export const usernameSchema = z
    .string()
    .min(3, 'USERNAME_TOO_SHORT')
    .max(30, 'USERNAME_TOO_LONG')
    .regex(/^[a-z0-9_]+$/, 'USERNAME_INVALID_CHARS');

/**
 * Zod schema for the username onboarding form.
 * Unlike the profile schema (where username is optional),
 * here it is strictly required — users MUST choose a username to proceed.
 */
export const usernameOnboardingSchema = z.object({
    username: usernameSchema,
});

export type UsernameOnboardingValues = z.infer<typeof usernameOnboardingSchema>;
