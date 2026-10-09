import { z } from 'zod';
import { usernameSchema } from './onboarding';

/**
 * Edit-profile form, validated identically on the client and in the server action.
 * Error messages are translation keys under `profile.edit.validation`.
 */
export const profileSchema = z.object({
    name: z.string().trim().min(2, 'NAME_TOO_SHORT').max(50, 'NAME_TOO_LONG'),
    image: z.string().url('IMAGE_INVALID').optional().or(z.literal('')),
    username: usernameSchema.optional().or(z.literal('')),
    bio: z.string().max(500, 'BIO_TOO_LONG').optional().or(z.literal('')),
    cities: z.string().optional().or(z.literal('')),
    avatarSeed: z.string().optional().or(z.literal('')),
    isProfilePublic: z.boolean(),
    allowDirectMessages: z.boolean(),
    showGroupsOnProfile: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
