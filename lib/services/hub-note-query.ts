import type { Prisma } from '@prisma/client';
import type { HubNoteRow } from './hub-note-row';

/** What the where-clause of a hub's Ziņas needs: the hub's category id. */
export interface NoteHub {
    id: string;
    slug: string;
    level: 2 | 3;
    title: string;
}

/**
 * The Ziņas a hub shows (K2-03): posted on the hub or (on an L2 hub) on one of its sub-veidi (K-118), ACTIVE category.
 * Everyone gets only unexpired notes; `mine` is the viewer's own in this hub, expired ones too (Manas).
 * Kur (K-116): a note without a city shows for every choice.
 */
export function hubNoteWhere(hub: Pick<NoteHub, 'id'>, o: { cities: string[]; q: string; tab: 'all' | 'mine'; viewerId?: string; now: Date }): Prisma.HubNoteWhereInput {
    const and: Prisma.HubNoteWhereInput[] = [
        { OR: [{ categoryId: hub.id }, { category: { parentId: hub.id } }] },
        { category: { status: 'ACTIVE' } },
    ];
    if (o.tab === 'mine') and.push({ authorId: o.viewerId ?? '' });
    else and.push({ expiresAt: { gt: o.now } });
    if (o.cities.length > 0) and.push({ OR: [{ cityId: null }, { city: { slug: { in: o.cities } } }] });
    if (o.q) and.push({ content: { contains: o.q, mode: 'insensitive' } });
    return { AND: and };
}

export interface NoteBox {
    /** Null = "Visai kopienai". */
    group: { name: string; href: string } | null;
    notes: HubNoteRow[];
}

export interface NoteSection {
    /** Null: no heading (an L3 hub, or only one section). */
    title: string | null;
    topicSlug: string;
    boxes: NoteBox[];
}

/**
 * Grouping (K2-04, K-111, K-118) of rows already newest first: the hub's own notes first, then one section per sub-veids
 * in order of its newest note; inside a section one box per group, the ungrouped ("Visai kopienai") last.
 */
export function groupNotes(rows: HubNoteRow[], hub: Pick<NoteHub, 'slug' | 'level' | 'title'>): NoteSection[] {
    const order = [hub.slug];
    for (const r of rows) if (!order.includes(r.topic.slug)) order.push(r.topic.slug);
    const sections = order
        .map((slug) => ({ slug, rows: rows.filter((r) => r.topic.slug === slug) }))
        .filter((s) => s.rows.length > 0)
        .map((s): NoteSection => {
            const boxes = new Map<string, NoteBox>();
            for (const r of s.rows) {
                const key = r.group?.href ?? '';
                const box = boxes.get(key) ?? { group: r.group, notes: [] };
                box.notes.push(r);
                boxes.set(key, box);
            }
            const list = [...boxes.entries()];
            const sorted = [...list.filter(([k]) => k !== ''), ...list.filter(([k]) => k === '')].map(([, b]) => b);
            return { title: s.slug === hub.slug ? hub.title : s.rows[0].topic.title, topicSlug: s.slug, boxes: sorted };
        });
    return hub.level === 3 || sections.length === 1 ? sections.map((s) => ({ ...s, title: null })) : sections;
}
