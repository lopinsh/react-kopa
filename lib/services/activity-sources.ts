import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ACTIVITY_PAGE_SIZE, ACTIVITY_KINDS, type ActivityKind } from '@/lib/constants/activity';
import { resolveEventText, toTextLang } from '@/lib/translations';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import type { ActivityCursor } from '@/lib/validations/activity';

export type ActivityEntry = {
    key: string;
    id: string;
    kind: ActivityKind;
    at: Date;
    /** Only EVENT_SIGNUP: picks the sentence. */
    status: 'GOING' | 'PENDING' | 'WAITLISTED' | null;
    actor: { name: string | null; href: string | null } | null;
    target: { name: string; href: string; hidden: boolean } | null;
};

type Person = { name: string | null; username: string | null } | null;
type GroupRef = { slug: string; name: string; hiddenAt: Date | null; category: Parameters<typeof TaxonomyResolver.resolve>[0] };
type EventTexts = { originalLang: string; translations: { lang: string; title: string; description: string | null; instructions: string | null }[] };

const TAKE = ACTIVITY_PAGE_SIZE + 1;
const rank = (kind: ActivityKind) => ACTIVITY_KINDS.indexOf(kind);

/** The OR alternatives that keep only rows after the cursor, in (at desc, rank asc, id desc) order. */
function after<W extends object>(cursor: ActivityCursor | null, kind: ActivityKind, make: (at: Date | Prisma.DateTimeFilter) => W): W[] | null {
    if (!cursor) return null;
    const k = rank(kind);
    const r = rank(cursor.kind);
    if (k > r) return [make({ lte: cursor.at })];
    if (k < r) return [make({ lt: cursor.at })];
    return [make({ lt: cursor.at }), { ...make(cursor.at), id: { lt: cursor.id } }];
}

function withCursor<W extends object>(base: W, alts: W[] | null): W {
    return alts ? ({ AND: [base, { OR: alts }] } as unknown as W) : base;
}

function actor(user: Person): ActivityEntry['actor'] {
    if (!user) return null;
    return { name: user.name ?? user.username, href: user.username ? `/profile/${user.username}` : null };
}

const groupPath = (g: GroupRef) => `/${TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}`;
const groupRef = { select: { slug: true, name: true, hiddenAt: true, category: { include: TaxonomyResolver.getInclude('lv') } } } as const;
const person = { select: { name: true, username: true } } as const;
const textRows = { select: { lang: true, title: true, description: true, instructions: true } } as const;
const target = (g: GroupRef, name: string, suffix = ''): ActivityEntry['target'] => ({ name, href: groupPath(g) + suffix, hidden: g.hiddenAt !== null });
const base = (kind: ActivityKind, id: string, at: Date) => ({ key: `${kind}~${id}`, id, kind, at, status: null });
const eventTitle = (e: EventTexts, locale: string) => resolveEventText(e.translations, toTextLang(locale), e.originalLang).title;

type Reader = (cursor: ActivityCursor | null, locale: string) => Promise<ActivityEntry[]>;

async function memberships(cursor: ActivityCursor | null, kind: 'MEMBER_JOINED' | 'MEMBER_REQUESTED', role: 'PENDING' | { in: ('MEMBER' | 'ADMIN')[] }): Promise<ActivityEntry[]> {
    const rows = await prisma.membership.findMany({
        where: withCursor<Prisma.MembershipWhereInput>({ role }, after(cursor, kind, (f) => ({ joinedAt: f }))),
        orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
        take: TAKE,
        select: { id: true, joinedAt: true, user: person, group: groupRef },
    });
    return rows.map((m) => ({ ...base(kind, m.id, m.joinedAt), actor: actor(m.user), target: target(m.group, m.group.name) }));
}

export const READERS: Record<ActivityKind, Reader> = {
    async USER_JOINED(cursor) {
        const rows = await prisma.user.findMany({
            where: withCursor<Prisma.UserWhereInput>({}, after(cursor, 'USER_JOINED', (f) => ({ createdAt: f }))),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: TAKE,
            select: { id: true, name: true, username: true, createdAt: true },
        });
        return rows.map((u) => ({ ...base('USER_JOINED', u.id, u.createdAt), actor: actor(u), target: null }));
    },
    async GROUP_CREATED(cursor) {
        const rows = await prisma.group.findMany({
            where: withCursor<Prisma.GroupWhereInput>({}, after(cursor, 'GROUP_CREATED', (f) => ({ createdAt: f }))),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: TAKE,
            select: { id: true, name: true, slug: true, hiddenAt: true, createdAt: true, category: { include: TaxonomyResolver.getInclude('lv') }, members: { where: { role: 'OWNER' }, take: 1, select: { user: person } } },
        });
        return rows.map((g) => ({ ...base('GROUP_CREATED', g.id, g.createdAt), actor: actor(g.members[0]?.user ?? null), target: target(g, g.name) }));
    },
    MEMBER_JOINED: (cursor) => memberships(cursor, 'MEMBER_JOINED', { in: ['MEMBER', 'ADMIN'] }),
    MEMBER_REQUESTED: (cursor) => memberships(cursor, 'MEMBER_REQUESTED', 'PENDING'),
    async EVENT_CREATED(cursor, locale) {
        const rows = await prisma.event.findMany({
            where: withCursor<Prisma.EventWhereInput>({}, after(cursor, 'EVENT_CREATED', (f) => ({ createdAt: f }))),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: TAKE,
            select: { id: true, slug: true, originalLang: true, createdAt: true, creator: person, translations: textRows, group: groupRef },
        });
        return rows.map((e) => ({ ...base('EVENT_CREATED', e.id, e.createdAt), actor: actor(e.creator), target: target(e.group, eventTitle(e, locale), `/events/${e.slug}`) }));
    },
    async EVENT_SIGNUP(cursor, locale) {
        const rows = await prisma.attendance.findMany({
            where: withCursor<Prisma.AttendanceWhereInput>({ status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } }, after(cursor, 'EVENT_SIGNUP', (f) => ({ joinedAt: f }))),
            orderBy: [{ joinedAt: 'desc' }, { id: 'desc' }],
            take: TAKE,
            select: { id: true, status: true, joinedAt: true, user: person, event: { select: { slug: true, originalLang: true, translations: textRows, group: groupRef } } },
        });
        return rows.flatMap((a) =>
            a.status === 'GOING' || a.status === 'PENDING' || a.status === 'WAITLISTED'
                ? [{ ...base('EVENT_SIGNUP', a.id, a.joinedAt), status: a.status, actor: actor(a.user), target: target(a.event.group, eventTitle(a.event, locale), `/events/${a.event.slug}`) }]
                : []
        );
    },
    async POST_PUBLISHED(cursor) {
        const rows = await prisma.post.findMany({
            where: withCursor<Prisma.PostWhereInput>({}, after(cursor, 'POST_PUBLISHED', (f) => ({ createdAt: f }))),
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: TAKE,
            select: { id: true, title: true, createdAt: true, author: person, group: groupRef },
        });
        return rows.map((p) => ({ ...base('POST_PUBLISHED', p.id, p.createdAt), actor: actor(p.author), target: target(p.group, p.title?.trim() || p.group.name, '/announcements') }));
    },
};
