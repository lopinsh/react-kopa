import type { Prisma } from '@prisma/client';
import { pickTitle } from '@/lib/utils/localized-title';
import { hubHref } from '@/lib/hub-path';
import { TaxonomyResolver } from './taxonomy-resolver.service';

const TITLES = { select: { lang: true, title: true } } as const;
const CHAIN = { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true } } } } } } as const;

/** What one Ziņa row is read with. */
export const NOTE_SELECT = {
    id: true, content: true, createdAt: true, expiresAt: true, authorId: true, categoryId: true,
    author: { select: { id: true, name: true, image: true, avatarSeed: true } },
    city: { select: { slug: true, nameLv: true, nameEn: true } },
    group: { select: { slug: true, name: true, type: true, hiddenAt: true, category: CHAIN } },
    category: { select: { id: true, slug: true, level: true, titles: TITLES, parent: { select: { slug: true, parent: { select: { slug: true } } } } } },
    _count: { select: { replies: true } },
} satisfies Prisma.HubNoteSelect;
export type NoteSource = Prisma.HubNoteGetPayload<{ select: typeof NOTE_SELECT }>;

export interface HubNoteRow {
    id: string;
    content: string;
    createdAt: Date;
    expiresAt: Date;
    expired: boolean;
    city: { slug: string; name: string } | null;
    /** Null when the note is for the whole community (no group, or the group is not public). */
    group: { name: string; href: string } | null;
    /** The Veids it was posted on, with the hub's Ziņas address (no locale). */
    topic: { slug: string; title: string; href: string };
    /** Null for a signed-out viewer (K-41): no names reach a public page. */
    author: { id: string; name: string | null; image: string | null; avatarSeed: string | null; flair: boolean } | null;
    replyCount: number;
    mine: boolean;
    canDelete: boolean;
    /** Filled by the chat request release (K2-3). */
    request: 'none' | 'pending' | 'open' | 'hidden';
}

export interface NoteViewer {
    id: string;
    role?: string | null;
}

/** A Ziņa's Veids as a hub address: `/games/boardgames/messages`. Null when the chain is broken. */
export function noteTopicHref(c: NoteSource['category']): string | null {
    if (c.level === 2 && c.parent) return `${hubHref(c.parent.slug, c.slug)}/messages`;
    if (c.level === 3 && c.parent?.parent) return `${hubHref(c.parent.parent.slug, c.parent.slug, c.slug)}/messages`;
    return null;
}

export function toNoteRow(n: NoteSource, o: { lang: string; locale: string; now: Date; viewer?: NoteViewer; isAdmin: boolean; flair: Set<string> }): HubNoteRow {
    const expired = n.expiresAt.getTime() <= o.now.getTime();
    const mine = !!o.viewer && n.authorId === o.viewer.id;
    const publicGroup = n.group && n.group.type === 'PUBLIC' && !n.group.hiddenAt ? n.group : null;
    return {
        id: n.id,
        content: n.content,
        createdAt: n.createdAt,
        expiresAt: n.expiresAt,
        expired,
        city: n.city ? { slug: n.city.slug, name: o.locale === 'en' ? n.city.nameEn : n.city.nameLv } : null,
        group: publicGroup ? { name: publicGroup.name, href: `/${TaxonomyResolver.resolve(publicGroup.category).l1Slug}/group/${publicGroup.slug}` } : null,
        topic: { slug: n.category.slug, title: pickTitle(n.category.titles, o.lang, n.category.slug), href: noteTopicHref(n.category) ?? '' },
        author: o.viewer ? { ...n.author, flair: o.flair.has(`${n.category.slug}:${n.authorId}`) } : null,
        // Replies vanish with the Ziņa's expiry (K-121).
        replyCount: expired ? 0 : n._count.replies,
        mine,
        canDelete: mine || o.isAdmin,
        request: 'none',
    };
}
