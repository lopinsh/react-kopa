import { z } from 'zod';
import { usernameSchema } from './onboarding';

export const USER_NAME_MAX = 50;
export const USER_BIO_MAX = 500;
export const USER_CONTACT_MAX = 200;

/**
 * Edit-profile form, validated identically on the client and in the server action.
 * Error messages are translation keys under `profile.edit.validation`.
 */
export const profileSchema = z.object({
    name: z.string().trim().min(2, 'NAME_TOO_SHORT').max(USER_NAME_MAX, 'NAME_TOO_LONG'),
    image: z.string().url('IMAGE_INVALID').optional().or(z.literal('')),
    username: usernameSchema.optional().or(z.literal('')),
    bio: z.string().max(USER_BIO_MAX, 'BIO_TOO_LONG').optional().or(z.literal('')),
    contact: z.string().trim().max(USER_CONTACT_MAX, 'CONTACT_TOO_LONG').optional().or(z.literal('')),
    cities: z.string().optional().or(z.literal('')),
    avatarSeed: z.string().optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** The privacy switches in Iestatījumi; each saves on its own, so any subset (at least one) is valid. */
export const privacySchema = z
    .object({
        isProfilePublic: z.boolean(),
        allowDirectMessages: z.boolean(),
        showGroupsOnProfile: z.boolean(),
        contactVisibleToAll: z.boolean(),
    })
    .partial()
    .refine((v) => Object.values(v).some((x) => x !== undefined), 'VALIDATION_FAILED');

/** The email digest switch in Iestatījumi (R33). */
export const emailSettingsSchema = z.object({ emailNotifications: z.boolean() }).strict();
