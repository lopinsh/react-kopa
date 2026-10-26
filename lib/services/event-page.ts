import { prisma } from '@/lib/prisma';
import type { AttendanceStatus, Prisma } from '@prisma/client';
import type { EventJoinModeValue } from '@/lib/constants';
import { eventTiming, type EventTiming } from '@/lib/event-dates';
import { resolveEventText, type TextLang } from '@/lib/translations';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { subCategoryTitles } from './group-card';
import { EVENT_ROW_INCLUDE } from './event-row';
import { toBannerCredit } from '@/lib/banner';
import type { BannerCredit } from '@/lib/validations/banner';
import type { EventJoinView, Face } from './event-panel';

/** A person on the organiser's lists. */
export interface Person { userId: string; name: string | null; username: string | null }

/** The event page (R9a): everything it shows, already cut to what this viewer may see. Panel and page share `Face` and `EventJoinView`. */
export interface EventPageData {
    id: string;
    slug: string;
    title: string;
    titleLang: TextLang;
    description: string | null;
    descriptionLang: TextLang;
    /** Null when withheld from this viewer or empty. Never sent to a client otherwise. */
    instructions: string | null;
    instructionsLang: TextLang;
    /** Instructions exist but this viewer may not read them yet (request events). */
    instructionsLocked: boolean;
    startDate: Date;
    endDate: Date | null;
    timing: EventTiming;
    city: string;
    isOnline: boolean;
    /** The address, or the online link; null when the link is withheld (request events, until approved). */
    location: string | null;
    onlineLinkLocked: boolean;
    /** The event's own image only; the group's image is in the banner. */
    image: string | null;
    imageCredit: BannerCredit;
    membersOnly: boolean;
    joinMode: EventJoinModeValue;
    isFull: boolean;
    maxParticipants: number | null;
    category: { l1Slug: string; l1Title: string; color: string };
    subCategories: string[];
    group: { name: string; slug: string; city: string };
    join: EventJoinView;
    /** `people` is null for signed-out viewers: they get the number only (D12). */
    going: { count: number; viewerGoing: boolean; people: Face[] | null };
    /** Organisers only; everyone else gets null. */
    organiser: { going: Person[]; pending: Person[]; waitlist: Person[] } | null;
}

/** The panel's group and counts, plus the texts with their instructions (stripped by `toEventPage`, never passed on raw). */
export const EVENT_PAGE_INCLUDE = (lang: TextLang) => ({
    translations: { select: { lang: true, title: true, description: true, instructions: true } },
    group: {
        select: {
            ...EVENT_ROW_INCLUDE(lang).group.select,
            id: true,
            city: true
        }
    },
    _count: { select: { attendees: { where: { status: 'GOING' as const } } } }
}) satisfies Prisma.EventInclude;

export type EventPageSource = Prisma.EventGetPayload<{ include: ReturnType<typeof EVENT_PAGE_INCLUDE> }>;

export interface EventPageViewer {
    myStatus: AttendanceStatus | null;
    canManage: boolean;
    /** Result of the instructions rule (open event, organiser, or approved). */
    canSeeInstructions: boolean;
    people: Face[] | null;
    organiser: EventPageData['organiser'];
}

export function toEventPage(e: EventPageSource, lang: TextLang, viewer: EventPageViewer, now: Date = new Date()): EventPageData {
    // Withheld instructions are never read from any language row (resolveEventText), and the raw rows stop here.
    const text = resolveEventText(e.translations, lang, e.originalLang, !viewer.canSeeInstructions);
    const resolved = TaxonomyResolver.resolve(e.group.category);
    const timing = eventTiming(e, now);
    // Events saved before "Tiešsaistē" existed are recognised by a link in the address.
    const online = e.isOnline || !!e.location?.toLowerCase().includes('http');
    // The meeting link of an approval event is practical info: it waits for the approval like the instructions.
    const onlineLinkLocked = online && !!e.location && !viewer.canSeeInstructions;
    return {
        id: e.id,
        slug: e.slug,
        title: text.title,
        titleLang: text.titleLang,
        description: text.description,
        descriptionLang: text.descriptionLang,
        instructions: text.instructions,
        instructionsLang: text.instructionsLang,
        instructionsLocked: !viewer.canSeeInstructions && text.hasInstructions,
        startDate: e.startDate,
        endDate: e.endDate,
        timing,
        city: e.city,
        isOnline: online,
        location: onlineLinkLocked ? null : e.location,
        onlineLinkLocked,
        image: e.bannerImage,
        imageCredit: toBannerCredit(e.bannerCreditName, e.bannerCreditUser),
        membersOnly: e.visibility === 'MEMBERS_ONLY',
        joinMode: e.joinMode,
        isFull: e.isFull,
        maxParticipants: e.maxParticipants,
        category: { l1Slug: resolved.l1Slug, l1Title: resolved.l1Title, color: resolved.accentColor },
        subCategories: subCategoryTitles(e.group.tags, lang),
        group: { name: e.group.name, slug: e.group.slug, city: e.group.city },
        join: { eventId: e.id, mode: e.joinMode, isFull: e.isFull, ended: timing === 'past', myStatus: viewer.myStatus, canManage: viewer.canManage },
        going: { count: e._count.attendees, viewerGoing: viewer.myStatus === 'GOING', people: viewer.people },
        organiser: viewer.canManage ? viewer.organiser : null
    };
}

/** The organiser's people lists, each in join order (never loaded for anyone else). */
export async function loadOrganiserLists(eventId: string): Promise<NonNullable<EventPageData['organiser']>> {
    const rows = await prisma.attendance.findMany({
        where: { eventId, status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } },
        orderBy: { joinedAt: 'asc' },
        select: { userId: true, status: true, user: { select: { name: true, username: true } } }
    });
    const of = (status: AttendanceStatus): Person[] => rows.filter((r) => r.status === status).map((r) => ({ userId: r.userId, name: r.user.name, username: r.user.username }));
    return { going: of('GOING'), pending: of('PENDING'), waitlist: of('WAITLISTED') };
}
