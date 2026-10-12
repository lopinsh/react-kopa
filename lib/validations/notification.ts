import { z } from 'zod';

export const notificationIdsSchema = z.object({
    ids: z.array(z.string().min(1).max(64)).min(1).max(50),
});
