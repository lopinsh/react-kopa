import { z } from 'zod';
import { usernameSchema } from './onboarding';

/**
 * Registration form, validated identically on the client and in the server action.
 * Error messages are translation keys under `auth.validation`.
 */
export const registerSchema = z
    .object({
        name: z.string().trim().min(2, 'NAME_TOO_SHORT').max(50, 'NAME_TOO_LONG'),
        username: usernameSchema,
        email: z.string().trim().toLowerCase().pipe(z.email('EMAIL_INVALID')),
        // bcrypt only uses the first 72 bytes of a password.
        password: z.string().min(8, 'PASSWORD_TOO_SHORT').max(72, 'PASSWORD_TOO_LONG'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'PASSWORDS_DONT_MATCH',
        path: ['confirmPassword'],
    });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
