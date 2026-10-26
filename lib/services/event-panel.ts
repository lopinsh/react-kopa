import type { AttendanceStatus, Prisma } from '@prisma/client';
import { PANEL_TEXT_MAX, type EventJoinModeValue } from '@/lib/constants';
import { resolveEventText, type TextLang } from '@/lib/translations';
import { plainExcerpt } from '@/lib/text-excerpt';
import { avatarUrl } from '@/lib/avatar';
import { toBannerCredit } from '@/lib/banner';
import type { BannerCredit } from '@/lib/validations/banner';
import { isEventPast } from '@/lib/event-dates';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { subCategoryTitles } from './group-card';
import { EVENT_ROW_INCLUDE } from './event-row';

/** One of the faces on "who is going": only people going whose profile is public. */
export interface Face { id: string; name: string; image: string }

/** What the join step (JoinStep, the event page and the panel) needs to name the viewer's next step. */
export interface EventJoinView {
    eventId: string;
    mode: EventJoinModeValue;
    isFull: boolean;
    ended: boolean;
    myStatus: AttendanceStatus | null;
    canManage: boolean;
}

/** The event panel (R6): titles and descriptions only, never instructions, never the online link. */
export interface EventPanelData {
    id: string;
    slug: string;
    title: string;
    titleLang: TextLang;
    text: string | null;
    textLang: TextLang;
    startDate: Date;
    endDate: Date | null;
    city: string;
    isOnline: boolean;
    /** Null when the event is online (the link stays on the event page). */
    location: string | null;
    /** The event's own image, else the group's. */
    image: string | null;
    /** Credit of `image`: the event's own, else the group's. */
    imageCredit: BannerCredit;
    membersOnly: boolean;
    category: { l1Slug: string; l1Title: string; color: string };
    subCategories: string[];
    group: { name: string; slug: string; city: string };
    join: EventJoinView;
    /** `people` is null for signed-out viewers: they get the number only (D12). */
    going: { count: number; viewerGoing: boolean; people: Face[] | null };
}

/** The row's include plus what the panel adds: the group's picture, city and the number going. */
export const EVENT_PANEL_INCLUDE = (lang: TextLang) => ({
    translations: EVENT_ROW_INCLUDE(lang).translations,
    group: {
        select: {
            ...EVENT_ROW_INCLUDE(lang).group.select,
            id: true,
            city: true,
            bannerImage: true,
            bannerCreditName: true,
            bannerCreditUser: true,
            isAcceptingMembers: true
        }
    },
    _count: { select: { attendees: { where: { status: 'GOING' as const } } } }
}) satisfies Prisma.EventInclude;

export type EventPanelSource = Prisma.EventGetPayload<{ include: ReturnType<typeof EVENT_PANEL_INCLUDE> }>;

export interface FaceSource { id: string; name: string | null; username: string | null; image: string | null; avatarSeed: string | null }

export function toFace(u: FaceSource): Face {
    return { id: u.id, name: u.name ?? u.username ?? '', image: avatarUrl(u) };
}

export function toEventPanel(
    e: EventPanelSource,
    lang: TextLang,
    viewer: { myStatus: AttendanceStatus | null; canManage: boolean; people: Face[] | null }
): EventPanelData {
    const text = resolveEventText(e.translations.map((t) => ({ ...t, instructions: null })), lang, e.originalLang, true);
    const resolved = TaxonomyResolver.resolve(e.group.category);
    // Events saved before "Tiešsaistē" existed are recognised by a link in the address.
    const online = e.isOnline || !!e.location?.toLowerCase().includes('http');
    return {
        id: e.id,
        slug: e.slug,
        title: text.title,
        titleLang: text.titleLang,
        text: plainExcerpt(text.description, PANEL_TEXT_MAX),
        textLang: text.descriptionLang,
        startDate: e.startDate,
        endDate: e.endDate,
        city: e.city,
        isOnline: online,
        location: online ? null : e.location,
        image: e.bannerImage ?? e.group.bannerImage,
        imageCredit: e.bannerImage ? toBannerCredit(e.bannerCreditName, e.bannerCreditUser) : toBannerCredit(e.group.bannerCreditName, e.group.bannerCreditUser),
        membersOnly: e.visibility === 'MEMBERS_ONLY',
        category: { l1Slug: resolved.l1Slug, l1Title: resolved.l1Title, color: resolved.accentColor },
        subCategories: subCategoryTitles(e.group.tags, lang),
        group: { name: e.group.name, slug: e.group.slug, city: e.group.city },
        join: { eventId: e.id, mode: e.joinMode, isFull: e.isFull, ended: isEventPast(e), myStatus: viewer.myStatus, canManage: viewer.canManage },
        going: { count: e._count.attendees, viewerGoing: viewer.myStatus === 'GOING', people: viewer.people }
    };
}
