import { categoryColor } from '@/lib/theme/category';
import type { CardActivity } from '@/lib/services/card-activity';
import type { GroupContext } from '@/lib/services/group.service';
import type { InboxRow, MessageView } from '@/lib/services/message.service';
import type { AnnouncementRow } from '@/lib/services/post.service';
import type { EventRowData } from '@/lib/services/event-row';
import { addDays, dayInZone } from '@/lib/discovery-dates';
import { eventWindow } from '@/lib/discovery-window';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import type { Member } from '@/components/groups/MemberCard';
import type { MyRequest, NewsGroup, NewsItem, NotificationView } from '@/lib/types/own-area';

/** The sample group's main category (Sports) and its tone. */
export const SAMPLE_L1_SLUG = 'sports';
export const SAMPLE_ACCENT = categoryColor(SAMPLE_L1_SLUG);

/** Looks up one sample text in the current language (`admin.handbook.ui.sample.*`). */
export type SampleText = (key: string) => string;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * Realistic sample data for the Handbook's UI-elements page, typed with the real types of each component.
 * Nothing here touches the database; ids are made up, so any button that calls the server answers with an error.
 */
export function buildUiSamples(s: SampleText, locale: string, now: Date = new Date()) {
    // The sample texts are written in the page language, so they must not be labelled as another language.
    const lang = locale === 'en' ? ('en' as const) : ('lv' as const);
    const ago = (ms: number) => new Date(now.getTime() - ms);
    const inDays = (days: number, hour = 18) => {
        const d = new Date(now.getTime() + days * DAY);
        d.setHours(hour, 0, 0, 0);
        return d;
    };

    const anna = { id: 'sample-anna', name: 'Anna Liepa', image: null, avatarSeed: 'anna' };
    const janis = { id: 'sample-janis', name: 'Jānis Bērziņš', image: null, avatarSeed: 'janis' };
    const marta = { id: 'sample-marta', name: 'Marta Ozola', image: null, avatarSeed: 'marta' };


    const groupCard = {
        id: 'sample-group',
        name: s('groupName'),
        slug: 'sample-group',
        city: 'Jelgava',
        lookingFor: null,
        tagline: s('groupTagline'),
        taglineLang: lang,
        bannerImage: null,
        memberCount: 23,
        category: { slug: 'hiking', l1Slug: SAMPLE_L1_SLUG, l1Title: s('parentCategory'), color: SAMPLE_ACCENT },
        subCategories: [s('category'), s('category2')],
        subCategorySlugs: ['sample-sub-1', 'sample-sub-2'],
    };
    const groupCardNote = { ...groupCard, id: 'sample-group-note', lookingFor: s('lookingFor') };
    const groupCardBare = { ...groupCard, id: 'sample-group-bare', tagline: null };
    const nextMeeting = inDays(3, 10);
    const cardEvent: CardActivity = { kind: 'event', at: nextMeeting, until: null };
    const cardAnnouncement: CardActivity = { kind: 'announcement', at: ago(5 * HOUR), title: s('announcementTitle') };

    const group: GroupContext = {
        id: 'sample-group',
        name: s('groupName'),
        slug: 'sample-group',
        description: s('groupDescription'),
        lookingFor: null,
        city: 'Jelgava',
        type: 'PUBLIC',
        categoryId: 'sample-category',
        bannerImage: null,
        isAcceptingMembers: true,
        socialLinks: { discord: null, website: 'https://example.org', instagram: null },
        stats: { memberCount: 23, pendingCount: 0 },
        user: { isMember: false, role: null, isAdmin: false, chatId: null },
        theme: { accentColor: SAMPLE_ACCENT },
        sections: [],
        pages: [],
        category: {
            id: 'sample-category',
            title: s('category'),
            slug: 'hiking',
            level: 2,
            parentTitle: s('parentCategory'),
            l1Slug: SAMPLE_L1_SLUG,
            l1Title: s('parentCategory'),
            subCategories: [s('category')],
            subCategorySlugs: ['sample-sub-1'],
            color: SAMPLE_ACCENT,
        },
        tags: [],
        moderation: { isSiteAdmin: false, hidden: null },
    };

    const memberGroupContext = { ...group, user: { isMember: true, role: 'MEMBER' as const, isAdmin: false, chatId: null } };

    // Event rows (AR-54): with an excerpt, one going, one asked, one online, one running since an earlier day.
    const today = dayInZone(now, DEFAULT_TIME_ZONE);
    const rowBase = {
        titleLang: lang,
        endDate: null,
        city: 'Jelgava',
        isOnline: false,
        excerpt: s('eventExcerpt'),
        tag: null,
        group: { name: s('groupName'), slug: 'sample-group' },
        category: { l1Slug: SAMPLE_L1_SLUG, l1Title: s('parentCategory'), color: SAMPLE_ACCENT },
        subCategories: [s('category'), s('category2')],
        joinState: 'open' as const,
    };
    const at = (day: string, hour: number, minute = 0) => new Date(`${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`);
    const eventDays: Array<{ day: string; rows: EventRowData[] }> = [
        { day: today, rows: [
            { ...rowBase, id: 'row-1', slug: 'sample-event-1', title: s('eventTitle'), startDate: at(today, 7, 30), tag: 'going' },
            { ...rowBase, id: 'row-2', slug: 'sample-event-2', title: s('eventTitle2'), startDate: at(today, 16), excerpt: null, tag: 'waiting', joinState: 'request' as const },
        ] },
        { day: addDays(today, 1), rows: [
            { ...rowBase, id: 'row-3', slug: 'sample-event-3', title: s('eventTitle3'), startDate: at(today, 6), endDate: at(addDays(today, 2), 15), city: 'Riga' },
            { ...rowBase, id: 'row-4', slug: 'sample-event-4', title: s('eventTitle2'), startDate: at(addDays(today, 1), 17), isOnline: true, joinState: 'full' as const },
        ] },
    ];
    const strip = eventWindow({ date: { kind: 'week' }, day: null }, today, DEFAULT_TIME_ZONE);
    const stripCounts: Record<string, number> = { [today]: 2, [addDays(today, 1)]: 2, [addDays(today, 3)]: 1 };

    const member = (id: string, p: typeof anna, role: string): Member => ({
        id,
        role,
        user: { id: p.id, name: p.name, username: p.name.split(' ')[0].toLowerCase(), avatarSeed: p.avatarSeed, image: null, allowDirectMessages: true, isProfilePublic: true },
    });
    const members = [member('m-1', anna, 'OWNER'), member('m-2', janis, 'ADMIN'), member('m-3', marta, 'MEMBER')];

    const requestMessage = { id: 'rm-1', content: s('requestMessage'), createdAt: ago(2 * HOUR), senderId: marta.id, sender: { name: marta.name, image: null } };

    const announcement: AnnouncementRow = {
        id: 'sample-post',
        title: s('announcementTitle'),
        content: s('announcementBody'),
        authorId: anna.id,
        groupId: 'sample-group',
        archivedAt: null,
        visibility: 'PUBLIC',
        createdAt: ago(3 * DAY),
        updatedAt: ago(3 * DAY),
        author: anna,
    };

    const conversations: InboxRow[] = [
        {
            id: 'c-1', kind: 'GROUP', isBlocked: false, readOnly: false, canBlock: true, viewerIsContact: false, unread: true, updatedAt: ago(HOUR),
            other: marta,
            group: { id: 'sample-group', name: s('groupName'), categoryTitle: s('category'), subCategories: [s('parentCategory')], l1Slug: SAMPLE_L1_SLUG, accentColor: SAMPLE_ACCENT, href: null },
            lastMessage: { id: 'lm-1', content: s('chatIn2'), createdAt: ago(HOUR), senderId: marta.id },
            sharedGroups: [], sharedMore: 0,
            origin: { type: 'JOIN_REQUEST', groupName: s('groupName'), groupHref: null },
        },
        {
            id: 'c-2', kind: 'DIRECT', isBlocked: false, readOnly: false, canBlock: true, viewerIsContact: false, unread: false, updatedAt: ago(DAY),
            other: janis, group: null,
            lastMessage: { id: 'lm-2', content: s('inboxLast'), createdAt: ago(DAY), senderId: anna.id },
            sharedGroups: [s('groupName')], sharedMore: 1,
            origin: null,
        },
    ];

    const chatMessage = (id: string, from: typeof anna, content: string, ms: number): MessageView => ({
        id, content, createdAt: ago(ms), senderId: from.id, conversationId: 'c-1', sender: from,
    });
    const chatMessages = [
        chatMessage('cm-1', marta, s('chatIn1'), 3 * HOUR),
        chatMessage('cm-2', anna, s('chatOut1'), 2 * HOUR),
        chatMessage('cm-3', marta, s('chatIn2'), HOUR),
    ];

    // Own area (R8): the notification rows (unread with a quote, read with the category line, one for site admins), news and a waiting request.
    const newsGroup: NewsGroup = { name: s('groupName'), path: `/${SAMPLE_L1_SLUG}/group/sample-group`, l1Slug: SAMPLE_L1_SLUG, color: SAMPLE_ACCENT, categoryTitle: s('parentCategory'), subCategory: s('category') };
    const notification = (id: string, type: string, args: Record<string, string>, read: boolean, ms: number): NotificationView => ({
        id, ids: [id], moreCount: 0, type, message: JSON.stringify({ args }), link: `/${SAMPLE_L1_SLUG}/group/sample-group`, read, audience: 'USER', createdAt: ago(ms), group: newsGroup,
    });
    const notifications: NotificationView[] = [
        notification('n-1', 'JOIN_REQUEST', { authorName: marta.name, excerpt: s('requestMessage') }, false, HOUR),
        notification('n-2', 'APPLICATION_ACCEPTED', {}, true, 2 * DAY),
    ];
    const adminNotification: NotificationView = { ...notification('n-3', 'ADMIN_REPORT', { excerpt: s('requestMessage') }, false, 3 * HOUR), audience: 'ADMIN', link: '/admin/reports', group: null };
    const newsPost: NewsItem = { kind: 'post', id: 'np-1', at: ago(5 * HOUR), isNew: true, group: newsGroup, title: s('announcementTitle'), excerpt: s('announcementBody') };
    const newsAnswer: NewsItem = { kind: 'answer', id: 'na-1', at: ago(DAY), isNew: true, group: newsGroup, accepted: true };
    const myRequest: MyRequest = { card: groupCard, groupId: 'sample-group-request', name: s('groupName'), path: `/${SAMPLE_L1_SLUG}/group/sample-group`, color: SAMPLE_ACCENT, since: ago(2 * DAY) };

    return {
        accent: SAMPLE_ACCENT,
        l1Slug: SAMPLE_L1_SLUG,
        groupCard,
        groupCardNote,
        groupCardBare,
        nextMeeting,
        cardEvent,
        cardAnnouncement,
        group,
        memberGroupContext,
        eventDays,
        today,
        strip,
        stripCounts,
        members,
        requestMessage,
        announcement,
        conversations,
        chatMessages,
        notifications,
        adminNotification,
        newsPost,
        newsAnswer,
        myRequest,
        viewerId: anna.id,
        marta,
    };
}

export type UiSamples = ReturnType<typeof buildUiSamples>;
