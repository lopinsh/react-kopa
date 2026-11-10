import { EventService } from './event.service';
import { DISCOVERY_EVENTS_MAX_LIMIT } from '@/lib/constants';
import type { DiscoveryParams } from '@/lib/discovery-params';
import type { EventWindow } from '@/lib/discovery-window';
import type { DayCount } from '@/lib/types/discovery';

const byDay = (rows: DayCount[]): Record<string, number> => Object.fromEntries(rows.map((r) => [r.day, r.count]));

/** Pasākumi's data for one window (`limit` rows, the most the board allows by default): the list (one row per event), and the per-day counts for the strip's week and the calendar. */
export async function loadEvents(p: DiscoveryParams, w: EventWindow, locale: string, zone: string, viewerId?: string, limit: number = DISCOVERY_EVENTS_MAX_LIMIT, publicOnly = false) {
    const filters = { category: p.category ?? undefined, cities: p.cities, tags: p.tags, search: p.q || undefined, publicOnly };
    const [list, week, calendar] = await Promise.all([
        EventService.getDiscoverableEvents({ ...filters, from: w.bounds.from, to: w.bounds.to, limit }, locale, viewerId),
        EventService.countEventsPerDay({ ...filters, ...w.weekBounds }, zone, viewerId),
        EventService.countEventsPerDay({ ...filters, ...w.calendarBounds }, zone, viewerId)
    ]);
    return { ...list, weekCounts: byDay(week), calendarCounts: byDay(calendar) };
}
