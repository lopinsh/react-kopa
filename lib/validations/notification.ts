import { z } from 'zod';
import { DROPDOWN_ROWS, NOTIFICATIONS_MAX_PAGES } from '@/lib/constants';

export const notificationIdsSchema = z.object({
    ids: z.array(z.string().min(1).max(64)).min(1).max(50),
});

/** The bell's dropdown asks for one tab's newest rows. */
export const notificationListSchema = z.object({
    audience: z.enum(['USER', 'ADMIN']),
    take: z.number().int().min(1).max(DROPDOWN_ROWS),
});

/** Paziņojumi page's `?page=` and `?tab=`: anything else falls back to page 1, personal tab. */
export const notificationPageSchema = z.object({
    page: z.coerce.number().int().min(1).max(NOTIFICATIONS_MAX_PAGES).catch(1),
    tab: z.enum(['admin']).optional().catch(undefined),
});
