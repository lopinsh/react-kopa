import type { AttendanceStatus, Prisma } from '@prisma/client';
import { EVENT_EXCERPT_MAX } from '@/lib/constants';
import { resolveEventText, type TextLang } from '@/lib/translations';
import { plainExcerpt } from '@/lib/text-excerpt';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { subCategoryTitles } from './group-card';

/** Spread into an event `include`: what every event row needs (titles and descriptions only; never instructions). */
export const EVENT_ROW_INCLUDE = (lang: TextLang) => ({
    translations: { select: { lang: true, title: true, description: true } },
    group: {
        select: {
            name: true,
            slug: true,
            category: { include: TaxonomyResolver.getInclude(lang) },
            tags: { where: { status: 'ACTIVE' as const }, select: { level: true, slug: true, titles: { select: { lang: true, title: true } } } }
        }
    }
}) satisfies Prisma.EventInclude;

export type EventRowSource = Prisma.EventGetPayload<{ include: ReturnType<typeof EVENT_ROW_INCLUDE> }>;

/** The one shape every event row (discovery, a group's Pasākumi, later my groups) is rendered from. */
export interface EventRowData {
    id: string;
    slug: string;
    title: string;
    titleLang: TextLang;
    startDate: Date;
    endDate: Date | null;
    city: string;
    isOnline: boolean;
    /** First words of the description, plain text; null when there is none. */
    excerpt: string | null;
    /** The viewer's tag: 'going' → "Eju", 'waiting' → outlined "Gaida" (PENDING or WAITLISTED); null otherwise or signed out. */
    tag: 'going' | 'waiting' | null;
    group: { name: string; slug: string };
    category: { l1Slug: string; l1Title: string; color: string };
    /** The group's level-2 tag titles, as on the group card. */
    subCategories: string[];
    /** How one joins (AR-56): 'open' joins at once, 'request' needs the organiser's OK, 'full' is marked full by the organiser. */
    joinState: 'open' | 'request' | 'full';
}

export function tagOf(status: AttendanceStatus | null | undefined): EventRowData['tag'] {
    if (status === 'GOING') return 'going';
    return status === 'PENDING' || status === 'WAITLISTED' ? 'waiting' : null;
}

export function toEventRow(e: EventRowSource, lang: TextLang, status: AttendanceStatus | null): EventRowData {
    const text = resolveEventText(e.translations.map((t) => ({ ...t, instructions: null })), lang, e.originalLang, true);
    const resolved = TaxonomyResolver.resolve(e.group.category);
    return {
        id: e.id,
        slug: e.slug,
        title: text.title,
        titleLang: text.titleLang,
        startDate: e.startDate,
        endDate: e.endDate,
        city: e.city,
        isOnline: e.isOnline,
        excerpt: plainExcerpt(text.description, EVENT_EXCERPT_MAX),
        tag: tagOf(status),
        group: { name: e.group.name, slug: e.group.slug },
        category: { l1Slug: resolved.l1Slug, l1Title: resolved.l1Title, color: resolved.accentColor },
        subCategories: subCategoryTitles(e.group.tags, lang),
        joinState: e.joinMode === 'OPEN' ? 'open' : e.isFull ? 'full' : 'request'
    };
}
