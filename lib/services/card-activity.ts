import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { legacyTitle } from '@/lib/utils/announcement-title';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { EventService } from './event.service';

/**
 * What a group card tells about the group (R21-G): one meeting (running, else the next), how many further public meetings there are,
 * and the newest public announcement. Each part is optional; the card picks the rows to show.
 */
export interface CardActivity {
    /** `until` is the end of an event that is running now, else null. */
    event?: { at: Date; until: Date | null; title: string };
    /** Upcoming public events besides `event`. */
    moreEvents: number;
    announcement?: { at: Date; title: string };
}

/**
 * The one place that decides which announcements a card may show to anyone: the not archived, public ones of a public group
 * (members-only items never reach a card).
 */
function publicAnnouncements(): Prisma.PostWhereInput {
    return { archivedAt: null, visibility: 'PUBLIC', group: { type: 'PUBLIC', hiddenAt: null } };
}

/**
 * Group id → card activity for the groups that have any: the next visible meeting, the count of further public meetings and the
 * newest public announcement. A group with none of them is left out. Three batched queries, none per group.
 */
export async function cardActivities(groups: Array<{ id: string }>, locale: string, viewerId?: string): Promise<Record<string, CardActivity>> {
    const ids = groups.map((g) => g.id);
    if (ids.length === 0) return {};
    const today = startOfTodayInRiga();
    const [next, counts, posts] = await Promise.all([
        EventService.getNextVisibleEvents(ids, locale, viewerId),
        prisma.event.groupBy({
            by: ['groupId'],
            where: { groupId: { in: ids }, visibility: 'PUBLIC', group: { type: 'PUBLIC', hiddenAt: null }, OR: [{ endDate: { gte: today } }, { endDate: null, startDate: { gte: today } }] },
            _count: { _all: true },
        }),
        prisma.post.findMany({
            where: { AND: [{ groupId: { in: ids } }, publicAnnouncements()] },
            orderBy: { createdAt: 'desc' },
            distinct: ['groupId'],
            select: { groupId: true, title: true, content: true, createdAt: true },
        }),
    ]);
    const result: Record<string, CardActivity> = {};
    const get = (id: string): CardActivity => (result[id] ??= { moreEvents: 0 });
    for (const [id, e] of next) get(id).event = { at: e.startDate, until: e.running ? e.endDate : null, title: e.title };
    for (const c of counts) {
        const entry = result[c.groupId];
        if (entry?.event) entry.moreEvents = Math.max(0, c._count._all - 1);
    }
    for (const p of posts) get(p.groupId).announcement = { at: p.createdAt, title: p.title ?? legacyTitle(p.content).title };
    return result;
}
