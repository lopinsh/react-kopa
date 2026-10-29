import { prisma } from '@/lib/prisma';
import { LOCALES } from '@/lib/constants';

const DAY_MS = 86_400_000;

/** Day-level last visit (R31-2): one row update at most per user per 24 h. It also stores the site language (R33) for the email digest. */
export const PresenceService = {
    /** The DB-side condition makes a repeat harmless: several `auth()` calls before the new cookie lands each find 0 rows. */
    async touch(userId: string, locale: string | null): Promise<void> {
        const now = new Date();
        const known = (LOCALES as readonly string[]).includes(locale ?? '') ? locale : null;
        await prisma.user.updateMany({
            where: { id: userId, OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: new Date(now.getTime() - DAY_MS) } }] },
            data: { lastSeenAt: now, ...(known ? { locale: known } : {}) },
        });
    },
};
