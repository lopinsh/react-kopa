import type { GroupContext } from '@/lib/services/group.service';
import type { InboxRow, MessageView } from '@/lib/services/message.service';
import type { AnnouncementRow } from '@/lib/services/post.service';
import type { DiscoverableEvent } from '@/lib/services/event.service';
import type { Member } from '@/components/groups/MemberCard';

/** Colour of the sample group's L1 category ("Movement & Wellness"). */
export const SAMPLE_ACCENT = '#4ADE80';
export const SAMPLE_L1_SLUG = 'movement';

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

    const category = { title: s('category'), l1Slug: SAMPLE_L1_SLUG, parentTitle: s('parentCategory'), color: SAMPLE_ACCENT };

    const groupCard = {
        id: 'sample-group',
        name: s('groupName'),
        slug: 'sample-group',
        description: s('groupDescription'),
        city: 'Jelgava',
        type: 'PUBLIC' as const,
        memberCount: 23,
        bannerImage: null,
        members: [anna, janis, marta].map((p) => ({ id: p.id, name: p.name, avatarSeed: p.avatarSeed, image: null })),
        category,
    };

    const group: GroupContext = {
        id: 'sample-group',
        name: s('groupName'),
        slug: 'sample-group',
        description: s('groupDescription'),
        city: 'Jelgava',
        type: 'PUBLIC',
        categoryId: 'sample-category',
        bannerImage: null,
        isAcceptingMembers: true,
        socialLinks: { discord: null, website: 'https://example.org', instagram: null },
        stats: { memberCount: 23, eventCount: 4 },
        user: { isMember: false, role: null, isAdmin: false },
        theme: { accentColor: SAMPLE_ACCENT },
        sections: [],
        members: [],
        category: {
            id: 'sample-category',
            title: s('category'),
            slug: 'hiking',
            level: 2,
            parentTitle: s('parentCategory'),
            l1Slug: SAMPLE_L1_SLUG,
            color: SAMPLE_ACCENT,
        },
        tags: [],
        moderation: { isSiteAdmin: false, hidden: null },
    };

    const memberGroupContext = { ...group, user: { isMember: true, role: 'MEMBER' as const, isAdmin: false } };

    const eventBase = {
        titleLang: lang,
        bannerImage: null,
        group: {
            name: s('groupName'),
            slug: 'sample-group',
            city: 'Jelgava',
            bannerImage: null,
            accentColor: SAMPLE_ACCENT,
            category: { slug: 'hiking', level: 2, parent: { slug: SAMPLE_L1_SLUG, parent: null } },
        },
    };

    const discoverableEvents: DiscoverableEvent[] = [
        { ...eventBase, id: 'sample-event-1', title: s('eventTitle'), slug: 'sample-event-1', startDate: inDays(3, 10), location: s('eventLocation'), joinMode: 'OPEN', isFull: false, isMembersOnly: false, goingCount: 12 },
        { ...eventBase, id: 'sample-event-2', title: s('eventTitle2'), slug: 'sample-event-2', startDate: inDays(6), location: null, joinMode: 'REQUEST', isFull: true, isMembersOnly: true, goingCount: 8 },
    ];

    const eventRowBase = {
        titleLang: lang,
        endDate: null,
        maxParticipants: 20,
        isFull: false,
        myStatus: null,
        canManage: false,
        pendingCount: 0,
    };
    const eventRows = [
        { ...eventRowBase, id: 'row-1', title: s('eventTitle'), startDate: inDays(3, 10), endDate: inDays(3, 13), location: s('eventLocation'), isMembersOnly: false, joinMode: 'OPEN' as const, goingCount: 12 },
        { ...eventRowBase, id: 'row-2', title: s('eventTitle2'), startDate: inDays(6), location: null, isMembersOnly: true, joinMode: 'REQUEST' as const, isFull: true, goingCount: 20 },
        { ...eventRowBase, id: 'row-3', title: s('eventTitle3'), startDate: inDays(-9), location: s('eventLocation'), isMembersOnly: false, joinMode: 'OPEN' as const, goingCount: 15, maxParticipants: null },
    ];

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
        parentId: null,
        archivedAt: null,
        createdAt: ago(3 * DAY),
        updatedAt: ago(3 * DAY),
        author: anna,
    };

    const conversations: InboxRow[] = [
        {
            id: 'c-1', kind: 'GROUP', isBlocked: false, readOnly: false, canBlock: true, viewerIsContact: false, unread: true, updatedAt: ago(HOUR),
            other: marta,
            group: { id: 'sample-group', name: s('groupName'), categoryTitle: s('category'), l1Slug: SAMPLE_L1_SLUG, accentColor: SAMPLE_ACCENT, href: null },
            lastMessage: { id: 'lm-1', content: s('chatIn2'), createdAt: ago(HOUR), senderId: marta.id },
            origin: { type: 'JOIN_REQUEST', groupName: s('groupName'), groupHref: null },
        },
        {
            id: 'c-2', kind: 'DIRECT', isBlocked: false, readOnly: false, canBlock: true, viewerIsContact: false, unread: false, updatedAt: ago(DAY),
            other: janis, group: null,
            lastMessage: { id: 'lm-2', content: s('inboxLast'), createdAt: ago(DAY), senderId: anna.id },
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

    return {
        accent: SAMPLE_ACCENT,
        l1Slug: SAMPLE_L1_SLUG,
        groupCard,
        group,
        memberGroupContext,
        discoverableEvents,
        eventRows,
        members,
        requestMessage,
        announcement,
        conversations,
        chatMessages,
        viewerId: anna.id,
        marta,
    };
}

export type UiSamples = ReturnType<typeof buildUiSamples>;
