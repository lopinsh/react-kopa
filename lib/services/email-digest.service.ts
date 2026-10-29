import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import {
    DEFAULT_LOCALE, LOCALES, EMAIL_DIGEST_DELAY_MS, EMAIL_DIGEST_LOOKBACK_MS, EMAIL_DIGEST_MAX_LINES, EMAIL_DIGEST_MAX_USERS,
} from '@/lib/constants';
import { DEMO_EMAIL_DOMAIN } from '@/lib/constants/vitality';
import { formatNotificationText } from '@/lib/utils/notification-text';
import { buildDigestEmail, type DigestTranslator } from '@/lib/email/digest-email';
import { sendMail } from '@/lib/email/mailer';
import { siteUrl } from '@/lib/email/site-url';
import { unsubscribePostUrl, unsubscribeUrl } from '@/lib/email/unsubscribe-token';
import { MessageService } from './message.service';
import { NotificationService, groupUnread } from './notification.service';

export type DigestRunResult = { users: number; sent: number; logged: number; failed: number; skipped: boolean };

type Person = { id: string; email: string; locale: string | null; messagesEmailedAt: Date | null };
type Line = { at: Date; text: string };

/** Held for the whole run (see `run`). */
const LOCK_KEY = 33033;
const RUN_TIMEOUT_MS = 5 * 60_000;

/** The group or event a notification is about, from its stored payload; never a person's text (no excerpt, reason or detail). */
function placeOf(message: string): string | undefined {
    try {
        const args = (JSON.parse(message) as { args?: { eventTitle?: unknown; groupName?: unknown } }).args;
        const place = args?.eventTitle ?? args?.groupName;
        return typeof place === 'string' && place !== '' ? place : undefined;
    } catch {
        return undefined;
    }
}

const localeOf = (person: Person) => ((LOCALES as readonly string[]).includes(person.locale ?? '') ? (person.locale as string) : DEFAULT_LOCALE);

/** The email digest (R33): one short email per person with unread things that waited 10 minutes. Never contains what people wrote. */
export const EmailDigestService = {
    /**
     * One run (every 5 minutes, from the cron route). A transaction-scoped advisory lock held on its own connection for the whole
     * run keeps two runs from overlapping; it is released with the transaction, even if the process dies.
     */
    async run(now: Date = new Date()): Promise<DigestRunResult> {
        const result: DigestRunResult = { users: 0, sent: 0, logged: 0, failed: 0, skipped: false };
        await prisma.$transaction(
            async (tx) => {
                const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(${LOCK_KEY}) AS locked`;
                if (!locked) {
                    result.skipped = true;
                    return;
                }
                const cutoff = new Date(now.getTime() - EMAIL_DIGEST_DELAY_MS);
                const since = new Date(now.getTime() - EMAIL_DIGEST_LOOKBACK_MS);
                const people = await findPeople(since, cutoff);
                result.users = people.length;
                for (const person of people) {
                    try {
                        const outcome = await sendDigest(person, now, since, cutoff);
                        if (outcome) result[outcome] += 1;
                    } catch (error) {
                        // Left unmarked: the next run retries.
                        console.error('[email-digest] send failed for user', person.id, error);
                        result.failed += 1;
                    }
                }
            },
            { maxWait: 5_000, timeout: RUN_TIMEOUT_MS },
        );
        return result;
    },
};

/** People who may be due an email, oldest item first, with the mailable ones only: opted in, an address, not a demo account. */
async function findPeople(since: Date, cutoff: Date): Promise<Person[]> {
    const [fromNotifications, fromMessages] = await Promise.all([
        NotificationService.digestCandidates(since, cutoff),
        MessageService.digestRecipients(since, cutoff),
    ]);
    const ids = [...new Set([...fromNotifications, ...fromMessages])];
    if (ids.length === 0) return [];
    const found = await prisma.user.findMany({
        where: {
            id: { in: ids },
            emailNotifications: true,
            email: { not: null },
            NOT: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
        },
        select: { id: true, email: true, locale: true, messagesEmailedAt: true },
    });
    const byId = new Map(found.flatMap((u) => (u.email ? [[u.id, { ...u, email: u.email }] as const] : [])));
    return ids.flatMap((id) => byId.get(id) ?? []).slice(0, EMAIL_DIGEST_MAX_USERS);
}

/** Builds and sends one person's email, then marks what it listed. Returns null when nothing is due. */
async function sendDigest(person: Person, now: Date, since: Date, cutoff: Date): Promise<'sent' | 'logged' | null> {
    const after = person.messagesEmailedAt && person.messagesEmailedAt > since ? person.messagesEmailedAt : since;
    const [chats, unread] = await Promise.all([
        MessageService.unreadForDigest(person.id, after),
        NotificationService.unreadForDigest(person.id, since),
    ]);
    const rows = groupUnread(unread);
    const due = chats.some((c) => c.newestAt <= cutoff) || unread.some((n) => n.createdAt <= cutoff);
    if (!due) return null;

    const locale = localeOf(person);
    const [t, tNotifications] = await Promise.all([
        getTranslations({ locale, namespace: 'email.digest' }),
        getTranslations({ locale, namespace: 'notifications' }),
    ]);
    const lines: Line[] = [
        ...chats.map((c) => ({ at: c.newestAt, text: t('message', { name: c.senderName || tNotifications('someone') }) })),
        ...rows.map((n) => {
            const place = placeOf(n.message);
            const headline = formatNotificationText(tNotifications, n.type, n.message, locale).headline;
            return { at: n.createdAt, text: place ? `${headline} · ${place}` : headline };
        }),
    ].sort((a, b) => b.at.getTime() - a.at.getTime());

    const email = buildDigestEmail({
        locale,
        count: lines.length,
        lines: lines.slice(0, EMAIL_DIGEST_MAX_LINES).map((l) => l.text),
        more: Math.max(0, lines.length - EMAIL_DIGEST_MAX_LINES),
        hasNotifications: rows.length > 0,
        siteUrl: siteUrl(),
        unsubscribeUrl: unsubscribeUrl(person.id, locale),
        unsubscribePostUrl: unsubscribePostUrl(person.id),
        t: t as DigestTranslator,
    });
    const outcome = await sendMail({ to: person.email, toUserId: person.id, ...email });

    // Send first, mark after: a crash in between can send one duplicate, never lose one.
    await NotificationService.markEmailed(rows.flatMap((n) => n.ids), now);
    if (chats.length > 0) await prisma.user.update({ where: { id: person.id }, data: { messagesEmailedAt: now } });
    return outcome;
}
