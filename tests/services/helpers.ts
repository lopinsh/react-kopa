import { prisma } from '@/lib/prisma';
import type { MembershipRole } from '@prisma/client';
import { ActionError } from '@/types/actions';
import type { EventFormValues } from '@/lib/validations/event';

/** Everyone who looks at a group. `siteAdmin` is a site ADMIN with no membership in the group. */
export const VIEWERS = ['signedOut', 'outsider', 'pending', 'member', 'admin', 'owner', 'siteAdmin'] as const;
export type Viewer = (typeof VIEWERS)[number];
export type GroupKind = 'public' | 'private' | 'hidden';

const RUN = Date.now().toString(36);
let counter = 0;
const unique = (prefix: string) => `${prefix}-${RUN}-${++counter}`;

export interface Cast {
    ids: Record<Exclude<Viewer, 'signedOut'>, string>;
    /** The user id for a viewer; undefined when signed out. */
    id(viewer: Viewer): string | undefined;
}

/** Seven users: one per viewer. Create once per file. */
export async function makeCast(): Promise<Cast> {
    const ids = {} as Cast['ids'];
    for (const v of VIEWERS) {
        if (v === 'signedOut') continue;
        const user = await prisma.user.create({
            data: { email: `${unique(v)}@test.local`, name: `Test ${v}`, role: v === 'siteAdmin' ? 'ADMIN' : 'USER' },
        });
        ids[v] = user.id;
    }
    return { ids, id: (v) => (v === 'signedOut' ? undefined : ids[v]) };
}

export interface Fixture {
    groupId: string;
    slug: string;
    l1Slug: string;
    /** Membership id of the pending applicant. */
    pendingMembershipId: string;
    eventSlug: { PUBLIC: string; MEMBERS_ONLY: string };
    eventId: { PUBLIC: string; MEMBERS_ONLY: string };
    postId: { PUBLIC: string; MEMBERS_ONLY: string };
}

/**
 * A fresh group with the cast's memberships (owner, admin, member, pending), one public and one members-only event, one public and one
 * members-only announcement. A private group's posts and events are what the data says; the fixture does not "fix" them.
 */
export async function makeGroup(cast: Cast, kind: GroupKind): Promise<Fixture> {
    const category = await prisma.category.findFirstOrThrow({ where: { level: 1 }, orderBy: { slug: 'asc' }, select: { id: true, slug: true } });
    const slug = unique(`g-${kind}`);
    const role: Record<'owner' | 'admin' | 'member' | 'pending', MembershipRole> = { owner: 'OWNER', admin: 'ADMIN', member: 'MEMBER', pending: 'PENDING' };
    const group = await prisma.group.create({
        data: {
            name: `Group ${slug}`,
            slug,
            city: 'Riga',
            type: kind === 'private' ? 'PRIVATE' : 'PUBLIC',
            categoryId: category.id,
            hiddenAt: kind === 'hidden' ? new Date() : null,
            hiddenReason: kind === 'hidden' ? 'test' : null,
            members: { create: (Object.keys(role) as (keyof typeof role)[]).map((k) => ({ userId: cast.ids[k], role: role[k] })) },
        },
        include: { members: { where: { role: 'PENDING' }, select: { id: true } } },
    });
    const eventSlug = { PUBLIC: 'open-event', MEMBERS_ONLY: 'closed-event' };
    const eventId = { PUBLIC: '', MEMBERS_ONLY: '' };
    const postId = { PUBLIC: '', MEMBERS_ONLY: '' };
    for (const visibility of ['PUBLIC', 'MEMBERS_ONLY'] as const) {
        const event = await prisma.event.create({
            data: {
                groupId: group.id,
                slug: eventSlug[visibility],
                city: 'Riga',
                location: 'Somewhere',
                visibility,
                creatorId: cast.ids.owner,
                startDate: new Date(Date.now() + 30 * 86_400_000),
                translations: { create: [{ lang: 'lv', title: `Event ${visibility}` }] },
            },
        });
        eventId[visibility] = event.id;
        const post = await prisma.post.create({
            data: { groupId: group.id, authorId: cast.ids.owner, title: `Post ${visibility}`, content: 'text', visibility },
        });
        postId[visibility] = post.id;
    }
    return { groupId: group.id, slug, l1Slug: category.slug, pendingMembershipId: group.members[0].id, eventSlug, eventId, postId };
}

/** Runs a service call and returns 'ok' or the ActionError code (anything else rethrows). */
export async function outcome(call: () => Promise<unknown>): Promise<string> {
    try {
        await call();
        return 'ok';
    } catch (error) {
        if (error instanceof ActionError) return error.code;
        throw error;
    }
}

export function eventForm(title: string, overrides: Partial<EventFormValues> = {}): EventFormValues {
    return {
        originalLang: 'lv',
        texts: { lv: { title, description: '', instructions: '' }, en: { title: '', description: '', instructions: '' } },
        startDate: new Date(Date.now() + 60 * 86_400_000),
        endDate: null,
        city: 'Riga',
        isOnline: false,
        location: 'Somewhere',
        bannerImage: null,
        maxParticipants: null,
        visibility: 'PUBLIC',
        joinMode: 'OPEN',
        isRecurring: false,
        recurrencePattern: null,
        ...overrides,
    };
}
