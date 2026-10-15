import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { MY_NEW_FALLBACK_DAYS } from '@/lib/constants';
import { NotificationService } from './notification.service';
import type { OwnCounts } from '@/lib/types/own-area';

const DAY_MS = 86_400_000;
/** Notifications that answer a request to join a group. */
export const ANSWER_TYPES = ['APPLICATION_ACCEPTED', 'REQUEST_APPROVED', 'APPLICATION_DECLINED'];

/** Events still on today or later. */
export const stillOn = (today: Date): Prisma.EventWhereInput => ({ OR: [{ endDate: { gte: today } }, { endDate: null, startDate: { gte: today } }] });
const notBy = (userId: string): Prisma.EventWhereInput => ({ OR: [{ creatorId: null }, { creatorId: { not: userId } }] });

/** The point "new" counts from: the last visit to Manas grupas, or a week back when there was none (AR-14, Default 1). */
export function sinceOf(seenAt: Date | null): Date {
    return seenAt ?? new Date(Date.now() - MY_NEW_FALLBACK_DAYS * DAY_MS);
}

/**
 * The numbers in the menus: unread notifications per tab and what is new in Manas grupas (Default 1: events and announcements
 * others put in your groups, answers to your requests, since the last visit). Five queries, none per group.
 */
export async function getOwnCounts(userId: string): Promise<OwnCounts> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, myGroupsSeenAt: true } });
    const since = sinceOf(user?.myGroupsSeenAt ?? null);
    const mine = { hiddenAt: null, members: { some: { userId, role: { not: 'PENDING' as const } } } };
    const [notifications, newEvents, newPosts, answers] = await Promise.all([
        NotificationService.getUnreadCounts(userId, user?.role ?? null),
        prisma.event.count({ where: { AND: [{ group: mine }, stillOn(startOfTodayInRiga()), notBy(userId), { createdAt: { gt: since } }] } }),
        prisma.post.count({ where: { group: mine, archivedAt: null, authorId: { not: userId }, createdAt: { gt: since } } }),
        prisma.notification.count({ where: { userId, audience: 'USER', type: { in: ANSWER_TYPES }, createdAt: { gt: since } } }),
    ]);
    return { myGroupsNew: newEvents + newPosts + answers, notifications };
}

/** Manas grupas has been opened: its "new" count starts again from now. */
export async function markMyGroupsSeen(userId: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { myGroupsSeenAt: new Date() } });
}
