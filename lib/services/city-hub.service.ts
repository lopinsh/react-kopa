import { prisma } from '@/lib/prisma';
import { HUB_NOTE_PAGE_MAX } from '@/lib/constants';
import { toTextLang } from '@/lib/translations';
import { CityService } from './city.service';
import { groupWhere } from './discovery-query';
import { hubMemberCount } from './hub-query';
import { scopeActivity, type FeedPeriod } from './hub-activity';
import { groupNotes, type NoteSection } from './hub-note-query';
import { NOTE_SELECT, toNoteRow, type HubNoteRow, type NoteViewer } from './hub-note-row';
import { HubCityService, type CityRoom } from './hub-city.service';
import type { Prisma } from '@prisma/client';

/** A city hub, "Kopiena Jelgava" (K3-16): derived from an ACTIVE `City`, one per city; its frame reads this once. The title ("Kopiena Jelgava") is made from `name` in the frame. */
export interface CityHubContext {
    cityId: string;
    slug: string;
    segment: string;
    /** The city's own name. */
    name: string;
    /** Without locale: `/jelgava`. */
    href: string;
    stats: { memberCount: number; groupCount: number };
}

export interface CityNoteList {
    rows: HubNoteRow[];
    sections: NoteSection[];
    total: number;
}

/** Active Ziņas of the city (K-131): any topic hub, request notes included. */
function noteWhere(cityId: string, q: string, now: Date): Prisma.HubNoteWhereInput {
    return { cityId, expiresAt: { gt: now }, category: { status: 'ACTIVE' }, ...(q ? { content: { contains: q, mode: 'insensitive' } } : {}) };
}

/** City hubs (K3-2): every Veids in one city, with read-only Ziņas. Nothing here writes. */
export const CityHubService = {
    /** The city hub at an address segment, or null (an unknown or pending city, or a segment a main category already owns). */
    async getContext(segment: string, locale: string): Promise<CityHubContext | null> {
        const city = await CityService.bySegment(segment, locale);
        if (!city) return null;
        if (await prisma.category.count({ where: { slug: segment.toLowerCase(), level: 1 } }) > 0) return null;
        const where = groupWhere({ cities: [city.slug] }, toTextLang(locale));
        const [groupCount, memberCount] = await Promise.all([prisma.group.count({ where }), hubMemberCount(where)]);
        return { cityId: city.id, slug: city.slug, segment: city.segment, name: city.name, href: `/${city.segment}`, stats: { memberCount, groupCount } };
    },

    /** Aktivitāte (K3-18): the activity of the city's public groups, whatever their Veids. */
    activity(ctx: CityHubContext, locale: string, zone: string): Promise<FeedPeriod[]> {
        return scopeActivity(groupWhere({ cities: [ctx.slug] }, toTextLang(locale)), null, locale, zone);
    },

    /** The city's Ziņas, newest first, grouped by Veids (K-111). Signed out (`viewer` undefined) `author` is null (K-41). */
    async notes(ctx: CityHubContext, o: { q: string; take: number }, locale: string, viewer?: NoteViewer): Promise<CityNoteList> {
        const now = new Date();
        const where = noteWhere(ctx.cityId, o.q, now);
        const [sources, total] = await Promise.all([
            prisma.hubNote.findMany({ where, select: NOTE_SELECT, orderBy: { createdAt: 'desc' }, take: Math.min(o.take, HUB_NOTE_PAGE_MAX) }),
            prisma.hubNote.count({ where }),
        ]);
        const rows = sources.map((n) => toNoteRow(n, { lang: toTextLang(locale), locale, now, viewer, isAdmin: false, flair: new Set<string>() }));
        return { rows, sections: groupNotes(rows, { slug: '', level: 2, title: '' }), total };
    },

    /** Pilsētas istabas (K3-20): the open topic x city hubs. */
    rooms(ctx: CityHubContext, locale: string): Promise<CityRoom[]> {
        return HubCityService.openInCity({ id: ctx.cityId, slug: ctx.slug, segment: ctx.segment }, locale);
    },
};
