import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { TextLang } from '@/lib/translations';

/**
 * Accent- and case-insensitive text matching for search ("pagajieni" finds "Pārgājieni"). Prisma's `contains` + `insensitive`
 * only folds case, so the ids of matching groups and events come from Postgres `unaccent(lower(…))`; the where-builders then
 * filter by those ids. The word is always a bound parameter (never part of the SQL text), with LIKE wildcards escaped.
 */

/** `%word%` with the LIKE wildcards in the word escaped. */
function likePattern(word: string): string {
    const escaped = word.trim().replace(/[\\%_]/g, (c) => '\\' + c);
    return '%' + escaped + '%';
}

/** Ids of the groups whose name, description, public section text (any language) or category title/slug contain the word. */
export async function matchingGroupIds(word: string, lang: TextLang): Promise<string[]> {
    const p = likePattern(word);
    const hit = (col: Prisma.Sql) => Prisma.sql`unaccent(lower(${col})) LIKE unaccent(lower(${p}))`;
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT g.id FROM "Group" g
        WHERE ${hit(Prisma.sql`g.name`)}
           OR ${hit(Prisma.sql`coalesce(g.description, '')`)}
           OR EXISTS (
                SELECT 1 FROM "GroupSection" s JOIN "GroupSectionTranslation" t ON t."sectionId" = s.id
                WHERE s."groupId" = g.id AND s.visibility = 'PUBLIC' AND (${hit(Prisma.sql`t.title`)} OR ${hit(Prisma.sql`t.content`)}))
           OR EXISTS (
                SELECT 1 FROM "Category" c LEFT JOIN "CategoryTranslation" ct ON ct."categoryId" = c.id AND ct.lang = ${lang}
                WHERE c.id = g."categoryId" AND (${hit(Prisma.sql`c.slug`)} OR ${hit(Prisma.sql`coalesce(ct.title, '')`)}))`;
    return rows.map((r) => r.id);
}

/** Ids of the events whose title or description (any language) or whose group's name or description contain the word. Instructions are never searched. */
export async function matchingEventIds(word: string): Promise<string[]> {
    const p = likePattern(word);
    const hit = (col: Prisma.Sql) => Prisma.sql`unaccent(lower(${col})) LIKE unaccent(lower(${p}))`;
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT e.id FROM "Event" e JOIN "Group" g ON g.id = e."groupId"
        WHERE ${hit(Prisma.sql`g.name`)}
           OR ${hit(Prisma.sql`coalesce(g.description, '')`)}
           OR EXISTS (
                SELECT 1 FROM "EventTranslation" t
                WHERE t."eventId" = e.id AND (${hit(Prisma.sql`t.title`)} OR ${hit(Prisma.sql`coalesce(t.description, '')`)}))`;
    return rows.map((r) => r.id);
}
