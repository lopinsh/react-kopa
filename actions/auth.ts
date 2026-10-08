'use server';

import { registerSchema } from '@/lib/validations/auth';
import { UserService } from '@/lib/services/user.service';
import type { ActionResponse } from '@/types/actions';

/** Creates an email + password account. The client signs in afterwards. */
export async function registerUser(input: unknown): Promise<ActionResponse> {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    return UserService.createCredentialsUser(parsed.data);
}
