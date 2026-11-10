import { prisma } from '@/lib/prisma';
import { eventWhere } from './discovery-query';
import { EventService } from './event.service';
import { loadEvents } from './event-window';
import type { EventWindow } from '@/lib/discovery-window';
import type { DiscoveryParams } from '@/lib/discovery-params';
import type { EventRowData } from './event-row';
import type { Prisma } from '@prisma/client';

export interface HubEvents {
    events: EventRowData[];
    hasMore: boolean;
    /** All events the list could show under the same filters (public ones and the viewer's own members-only ones). */
    total: number;
    /** Upcoming only: events per day for the strip's week and the calendar. */
    weekCounts: Record<string, number>;
    calendarCounts: Record<string, number>;
}

const visibleTo = (viewerId?: string): Prisma.EventWhereInput => viewerId
    ? { OR: [{ visibility: 'PUBLIC' }, { visibility: 'MEMBERS_ONLY', group: { members: { some: { userId: viewerId, role: { not: 'PENDING' } } } } }] }
    : { visibility: 'PUBLIC' };

/**
 * A hub's events (K1-14): the board's own loaders with the hub's Tēma and Veids as the filters, so a hub lists what the board lists for them.
 * Upcoming: the window's days (the strip's choice); past: everything over, newest first. `limit` rows, then `hasMore`.
 */
export async function hubEvents(
    hub: { slug: string; l1Slug: string },
    o: { when: 'upcoming' | 'past'; params: DiscoveryParams; window: EventWindow; limit: number },
    locale: string,
    zone: string,
    viewerId?: string,
): Promise<HubEvents> {
    const filters = { category: hub.l1Slug, tags: [hub.slug], cities: o.params.cities };
    if (o.when === 'past') {
        const [list, total] = await Promise.all([
            EventService.getDiscoverableEvents({ ...filters, past: true, limit: o.limit }, locale, viewerId),
            prisma.event.count({ where: { AND: [eventWhere({ ...filters, past: true }), visibleTo(viewerId)] } }),
        ]);
        return { ...list, total, weekCounts: {}, calendarCounts: {} };
    }
    const w = o.window;
    const [loaded, total] = await Promise.all([
        loadEvents({ ...o.params, ...filters }, w, locale, zone, viewerId, o.limit),
        prisma.event.count({ where: { AND: [eventWhere({ ...filters, from: w.bounds.from, to: w.bounds.to }), visibleTo(viewerId)] } }),
    ]);
    return { events: loaded.events, hasMore: loaded.hasMore, total, weekCounts: loaded.weekCounts, calendarCounts: loaded.calendarCounts };
}

/** The next `take` upcoming events of the hub for Pārskats (K1-21) and how many there are in all, under the Kur filter; same visibility as the page. */
export async function hubEventPreview(
    hub: { slug: string; l1Slug: string },
    o: { cities: string[]; take: number },
    locale: string,
    viewerId?: string,
): Promise<{ events: EventRowData[]; total: number }> {
    const filters = { category: hub.l1Slug, tags: [hub.slug], cities: o.cities };
    const [list, total] = await Promise.all([
        EventService.getDiscoverableEvents({ ...filters, limit: o.take }, locale, viewerId),
        prisma.event.count({ where: { AND: [eventWhere(filters), visibleTo(viewerId)] } }),
    ]);
    return { events: list.events, total };
}
