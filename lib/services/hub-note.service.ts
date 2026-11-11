import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ActionError } from '@/types/actions';
import { HUB_NOTE_ACTIVE_MAX, HUB_NOTE_DAYS, HUB_NOTE_PAGE_MAX } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';
import { toTextLang } from '@/lib/translations';
import type { HubNoteEditInput, HubNoteInput } from '@/lib/validations/hub-note';
import type { HubContext } from './hub.service';
import { CityService, type CityOption } from './city.service';
import { hubGroupWhere } from './hub-query';
import { hubNoteWhere, groupNotes, type NoteSection } from './hub-note-query';
import { NOTE_SELECT, noteTopicHref, toNoteRow, type HubNoteRow, type NoteViewer } from './hub-note-row';

export type { HubNoteRow, NoteViewer } from './hub-note-row';
export type { NoteSection } from './hub-note-query';

export interface HubNoteList {
    rows: HubNoteRow[];
    sections: NoteSection[];
}

export interface NoteComposeOptions {
    topics: Array<{ slug: string; title: string; groups: Array<{ id: string; name: string }> }>;
    cities: CityOption[];
    activeCount: number;
}

const MS_DAY = 86_400_000;
const expiryFrom = (now: Date) => new Date(now.getTime() + HUB_NOTE_DAYS * MS_DAY);

/** One lock per author (not per hub): two tabs cannot post a 4th active note (K-27a). Released at commit. */
async function lockAuthor(tx: Prisma.TransactionClient, userId: string): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'hub-note:' + userId}))`;
}

async function assertRoom(tx: Prisma.TransactionClient, userId: string, now: Date): Promise<void> {
    const active = await tx.hubNote.count({ where: { authorId: userId, expiresAt: { gt: now } } });
    if (active >= HUB_NOTE_ACTIVE_MAX) throw new ActionError('HUB_NOTE_LIMIT');
}

/** The Veids a note is posted on: an ACTIVE L2/L3 with an ACTIVE chain above it. */
async function findTopic(slug: string) {
    const c = await prisma.category.findFirst({
        where: { slug, level: { in: [2, 3] }, status: 'ACTIVE' },
        select: { id: true, slug: true, level: true, parent: { select: { id: true, status: true, parent: { select: { id: true, status: true } } } } },
    });
    const l1 = c?.level === 2 ? c.parent : c?.parent?.parent;
    const above = c?.level === 3 ? c.parent : null;
    if (!c || !l1 || l1.status !== 'ACTIVE' || (above && above.status !== 'ACTIVE')) throw new ActionError('NOT_FOUND');
    return { id: c.id, slug: c.slug, l1Id: l1.id };
}

/** The author's own group in that hub (K-117), else FORBIDDEN. */
async function assertOwnGroup(groupId: string, userId: string, topic: { slug: string; l1Id: string }): Promise<void> {
    const found = await prisma.group.findFirst({
        where: { AND: [{ id: groupId }, hubGroupWhere(topic, [], 'en'), { members: { some: { userId, role: { not: 'PENDING' } } } }] },
        select: { id: true },
    });
    if (!found) throw new ActionError('FORBIDDEN');
}

async function cityId(slug: string | null | undefined): Promise<string | null> {
    if (!slug) return null;
    const city = await prisma.city.findFirst({ where: { slug, status: 'ACTIVE' }, select: { id: true } });
    if (!city) throw new ActionError('VALIDATION_FAILED');
    return city.id;
}

/** Notes of a hub (K2). Permission and limit checks live here; actions only authenticate. Replies join in K2-3. */
export const HubNoteService = {
    /** The hub's Ziņas, newest first, with the grouped sections. Signed out (`viewer` undefined): `author` is null (K-41). */
    async list(hub: HubContext, o: { cities: string[]; q: string; tab: 'all' | 'mine'; take: number }, locale: string, viewer?: NoteViewer): Promise<HubNoteList> {
        const now = new Date();
        if (o.tab === 'mine' && !viewer) return { rows: [], sections: [] };
        const sources = await prisma.hubNote.findMany({
            where: hubNoteWhere(hub, { ...o, viewerId: viewer?.id, now }),
            select: NOTE_SELECT,
            orderBy: { createdAt: 'desc' },
            take: Math.min(o.take, HUB_NOTE_PAGE_MAX),
        });
        const lang = toTextLang(locale);
        // Flair (K-33a): the author is a member of one of the hub's groups on the note's Veids.
        const flair = new Set<string>();
        if (viewer) {
            const bySlug = new Map<string, Set<string>>();
            for (const n of sources) bySlug.set(n.category.slug, (bySlug.get(n.category.slug) ?? new Set()).add(n.authorId));
            await Promise.all([...bySlug].map(async ([slug, authors]) => {
                const rows = await prisma.membership.findMany({
                    where: { userId: { in: [...authors] }, role: { not: 'PENDING' }, group: hubGroupWhere({ l1Id: hub.l1Id, slug }, [], lang) },
                    select: { userId: true },
                    distinct: ['userId'],
                });
                rows.forEach((r) => flair.add(`${slug}:${r.userId}`));
            }));
        }
        const rows = sources.map((n) => toNoteRow(n, { lang, locale, now, viewer, isAdmin: isSiteAdmin(viewer?.role), flair }));
        return { rows, sections: o.tab === 'mine' ? [] : groupNotes(rows, hub) };
    },

    /** The person's active notes across the site ("{n} no 3 visā vietnē"). */
    async activeCount(userId: string): Promise<number> {
        return prisma.hubNote.count({ where: { authorId: userId, expiresAt: { gt: new Date() } } });
    },

    /** What the compose form offers: the hub and its sub-veidi, the person's groups on each, the active cities. */
    async composeOptions(hub: HubContext, userId: string, locale: string): Promise<NoteComposeOptions> {
        const lang = toTextLang(locale);
        const topics = [{ slug: hub.slug, title: hub.title }, ...hub.subTopics.map((t) => ({ slug: t.slug, title: t.title }))];
        const [withGroups, cities, activeCount] = await Promise.all([
            Promise.all(topics.map(async (t) => ({
                ...t,
                groups: await prisma.group.findMany({
                    where: { AND: [hubGroupWhere({ l1Id: hub.l1Id, slug: t.slug }, [], lang), { members: { some: { userId, role: { not: 'PENDING' } } } }] },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                }),
            }))),
            CityService.listActive(locale),
            HubNoteService.activeCount(userId),
        ]);
        return { topics: withGroups, cities, activeCount };
    },

    /** Posts a Ziņa. `href` is the Ziņas page of its Veids with `?z=` (no locale). */
    async create(userId: string, input: HubNoteInput): Promise<{ id: string; href: string }> {
        const topic = await findTopic(input.categorySlug);
        if (input.groupId) await assertOwnGroup(input.groupId, userId, topic);
        const cityIdValue = await cityId(input.citySlug);
        const now = new Date();
        const note = await prisma.$transaction(async (tx) => {
            await lockAuthor(tx, userId);
            await assertRoom(tx, userId, now);
            return tx.hubNote.create({
                data: { authorId: userId, categoryId: topic.id, cityId: cityIdValue, groupId: input.groupId ?? null, content: input.content, expiresAt: expiryFrom(now) },
                select: { id: true, category: NOTE_SELECT.category },
            });
        });
        return { id: note.id, href: `${noteTopicHref(note.category) ?? ''}?z=${note.id}` };
    },

    /** Edits an active Ziņa of one's own. The form sends the full state: no group / city clears them. */
    async edit(userId: string, id: string, input: HubNoteEditInput): Promise<void> {
        const note = await prisma.hubNote.findUnique({
            where: { id },
            select: { authorId: true, expiresAt: true, category: { select: { slug: true, level: true, parent: { select: { id: true, parent: { select: { id: true } } } } } } },
        });
        if (!note) throw new ActionError('NOT_FOUND');
        if (note.authorId !== userId) throw new ActionError('FORBIDDEN');
        if (note.expiresAt.getTime() <= Date.now()) throw new ActionError('NOT_FOUND');
        if (input.groupId) {
            const l1Id = note.category.level === 2 ? note.category.parent?.id : note.category.parent?.parent?.id;
            if (!l1Id) throw new ActionError('NOT_FOUND');
            await assertOwnGroup(input.groupId, userId, { slug: note.category.slug, l1Id });
        }
        const cityIdValue = await cityId(input.citySlug);
        await prisma.hubNote.update({ where: { id }, data: { content: input.content, groupId: input.groupId ?? null, cityId: cityIdValue } });
    },

    /** Hard delete (replies and reports go with it): the author or a site admin. */
    async delete(viewer: NoteViewer, id: string): Promise<void> {
        const note = await prisma.hubNote.findUnique({ where: { id }, select: { authorId: true } });
        if (!note) throw new ActionError('NOT_FOUND');
        if (note.authorId !== viewer.id && !isSiteAdmin(viewer.role)) throw new ActionError('FORBIDDEN');
        await prisma.hubNote.delete({ where: { id } });
    },

    /**
     * Extends a Ziņa by `HUB_NOTE_DAYS` from now (author only). Renewing an expired one needs room under the limit and
     * starts it clean: its replies are deleted (K-121). An active one keeps its replies.
     */
    async renew(userId: string, id: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await lockAuthor(tx, userId);
            const note = await tx.hubNote.findUnique({ where: { id }, select: { authorId: true, expiresAt: true } });
            if (!note) throw new ActionError('NOT_FOUND');
            if (note.authorId !== userId) throw new ActionError('FORBIDDEN');
            const now = new Date();
            if (note.expiresAt.getTime() <= now.getTime()) {
                await assertRoom(tx, userId, now);
                await tx.hubNoteReply.deleteMany({ where: { noteId: id } });
            }
            await tx.hubNote.update({ where: { id }, data: { expiresAt: expiryFrom(now) } });
        });
    },
};
