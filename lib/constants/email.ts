import type { NotificationPayload } from '@/lib/services/notification.service';

/** An item waits this long before it may be mailed (R33). */
export const EMAIL_DIGEST_DELAY_MS = 10 * 60_000;
/** Older items never trigger mail (no blast on first deploy). */
export const EMAIL_DIGEST_LOOKBACK_MS = 24 * 60 * 60_000;
/** More lines than this become "and N more". */
export const EMAIL_DIGEST_MAX_LINES = 10;
/** People mailed per cron run; the rest go in the next run. */
export const EMAIL_DIGEST_MAX_USERS = 200;
/** Notification types that may be emailed: requests, applications, inquiries, approvals, accepts, let-ins and declines. */
export const EMAIL_DIGEST_TYPES = [
    'JOIN_REQUEST', 'APPLICATION_RECEIVED', 'INQUIRY_RECEIVED', 'APPLICATION_INQUIRY',
    'REQUEST_APPROVED', 'APPLICATION_ACCEPTED', 'APPLICATION_DECLINED',
    'EVENT_REQUEST', 'EVENT_APPROVED', 'EVENT_DECLINED', 'EVENT_LET_IN',
] as const satisfies readonly NotificationPayload['type'][];
