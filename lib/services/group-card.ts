import { TaxonomyResolver, type TaxonomyModel } from './taxonomy-resolver.service';
import { pickTitle } from '@/lib/utils/localized-title';
import { GROUP_TAGLINE_MAX } from '@/lib/constants';
import { plainExcerpt } from '@/lib/text-excerpt';
import { resolveText, toTextLang, type TextLang } from '@/lib/translations';

/**
 * Query fragment every group card needs besides the group's own columns and its category: the
 * member count (pending applicants are not members) and the active tags (the card's sub-categories).
 * Spread it into a Prisma `select` or `include`.
 */
export const GROUP_CARD_RELATIONS = {
    _count: { select: { members: { where: { role: { not: 'PENDING' as const } } }, sections: true } },
    // The home section (order 0) feeds the tagline.
    sections: {
        where: { order: 0 },
        take: 1,
        select: { visibility: true, originalLang: true, translations: { select: { lang: true, content: true } } },
    },
    tags: {
        where: { status: 'ACTIVE' as const },
        select: { level: true, slug: true, titles: { select: { lang: true, title: true } } },
    },
} as const;

/** What `toGroupCard` reads from a group fetched with the card columns, its category chain and GROUP_CARD_RELATIONS. */
export interface GroupCardSource {
    id: string;
    name: string;
    slug: string;
    city: string;
    lookingFor: string | null;
    /** Read only for old groups without section rows (the tagline's fallback). */
    description: string | null;
    bannerImage: string | null;
    category: TaxonomyModel;
    _count: { members: number; sections: number };
    sections: Array<{ visibility: string; originalLang: string; translations: Array<{ lang: string; content: string }> }>;
    tags: Array<{ level: number; slug: string; titles: Array<{ lang: string; title: string }> }>;
}

type CardTag = GroupCardSource['tags'][number];

/** A group's level-2 tag titles in the viewer's language (the card's and the event row's sub-categories). */
export function subCategoryTitles(tags: CardTag[], lang: string): string[] {
    return tags.filter((t) => t.level === 2).map((t) => pickTitle(t.titles, lang, t.slug));
}

/** The slugs of the same level-2 tags, in the same order (the category line links to discovery with them). */
export function subCategorySlugs(tags: CardTag[]): string[] {
    return tags.filter((t) => t.level === 2).map((t) => t.slug);
}

/**
 * The card's short idea of the group: the first words of the PUBLIC home section in the viewer's language (the written language
 * when there is no translation), plain text. A members-only home section gives none; `description` only when the group has no sections.
 */
function taglineOf(group: GroupCardSource, lang: string): { tagline: string | null; taglineLang: TextLang } {
    const viewer = toTextLang(lang);
    const home = group.sections[0];
    if (!home) return { tagline: group._count.sections === 0 ? plainExcerpt(group.description, GROUP_TAGLINE_MAX) : null, taglineLang: viewer };
    if (home.visibility !== 'PUBLIC') return { tagline: null, taglineLang: viewer };
    const text = resolveText(home.translations, viewer, home.originalLang, (r) => r.content);
    // The written language when there is no translation: the card marks it with `lang`.
    return { tagline: plainExcerpt(text.value, GROUP_TAGLINE_MAX), taglineLang: text.lang };
}

/** The one shape the group cards and rows (discovery, profile, my groups) are rendered from. */
export function toGroupCard(group: GroupCardSource, lang: string) {
    const resolved = TaxonomyResolver.resolve(group.category);
    return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        city: group.city,
        lookingFor: group.lookingFor,
        ...taglineOf(group, lang),
        bannerImage: group.bannerImage,
        memberCount: group._count.members,
        category: {
            slug: resolved.categorySlug,
            l1Slug: resolved.l1Slug,
            l1Title: resolved.l1Title,
            color: resolved.accentColor,
        },
        subCategories: subCategoryTitles(group.tags, lang),
        subCategorySlugs: subCategorySlugs(group.tags),
    };
}

export type GroupCardData = ReturnType<typeof toGroupCard>;
