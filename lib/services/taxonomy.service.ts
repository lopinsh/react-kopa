import { ActionError } from '@/types/actions';
import { Prisma, CategoryAlias } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import * as TaxonomyWrite from './taxonomy-write';
import { createUniqueCategorySlug } from './taxonomy-write';
import { slugify } from '@/lib/slug';
import { categoryColor } from '@/lib/theme/category';
import { categoryImage, type CategoryImage } from '@/lib/banner';
import { pickTitle } from '@/lib/utils/localized-title';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { MAX_GROUP_SUBTAGS, MAX_GROUP_TAGS, MIN_PENDING_TAG_SUPPORTERS } from '@/lib/constants';

export type L3Tag = {
    id: string;
    slug: string;
    title: string;
    isWildcard: boolean;
    status: 'ACTIVE' | 'PENDING_REVIEW';
    /** Own photo, else its Veids's. */
    image: CategoryImage | null;
};

export type L2Category = {
    id: string;
    slug: string;
    slugLv: string | null;
    title: string;
    /** Languages this sub-category has a name in (the admin tree flags a missing one). */
    langs: Array<'en' | 'lv'>;
    status: 'ACTIVE' | 'PENDING_REVIEW';
    image: CategoryImage | null;
    tags: L3Tag[];
};

export type L1Category = {
    id: string;
    slug: string;
    title: string;
    /** The colour to show: the category's theme tone (`var(--cat-<slug>)`), else the stored hex. */
    color: string;
    /** The stored `Category.color` (hex or null), for the admin colour editor only. */
    storedColor: string | null;
    subcategories: L2Category[];
    aliases: Array<{ id: string; value: string; locale: string | null; createdAt: Date }>;
};

export type TaxonomyTree = L1Category[];

export type L2SearchResult = {
    id: string;
    slug: string;
    title: string;
    isAlias: boolean;
    /** 2 = Veids, 3 = sub-veids (`parentId` is its Veids). */
    level: 2 | 3;
    parentId: string;
};

/** A pending sub-category the tag picker may offer. */
export type PendingTagOption = {
    id: string;
    slug: string;
    title: string;
    /** Chosen by enough different people to be offered to everyone. */
    isPublic: boolean;
    /** 2 = Veids, 3 = sub-veids; `parentId` is the L1 (level 2) or the Veids (level 3). */
    level: 2 | 3;
    parentId: string;
};

export type PendingCategoryWithContext = {
    id: string;
    slug: string;
    submittedAt: Date | null;
    submittedLabel: string;
    /** Language the suggestion was typed in (the one title it has). */
    submittedLang: 'en' | 'lv';
    /** 2 = Veids suggestion, 3 = sub-veids suggestion (then `parent` is the Veids and `grandparentTitle` its L1). */
    level: number;
    grandparentTitle: string | null;
    parent: {
        id: string;
        slug: string;
        title: string;
    } | null;
    submitter: {
        id: string;
        username: string | null;
        name: string | null;
    } | null;
    groups: Array<{
        id: string;
        name: string;
        slug: string;
        l1Slug: string;
    }>;
};

export type ActiveL2WithAliases = {
    id: string;
    slug: string;
    slugLv: string | null;
    /** 2 = Veids, 3 = sub-veids (its parentId is then the Veids). */
    level: number;
    parentId: string | null;
    parentSlug: string | null;
    translations: Array<{ lang: string; title: string }>;
    aliases: Array<{ id: string; value: string; locale: string | null; createdAt: Date }>;
};

/** One owner to tell that a pending sub-category on their group was merged into an existing one. */
export type TagMergeNotice = {
    userId: string;
    args: { originalTag: string; canonicalTag: string; canonicalTagEn: string; canonicalTagLv: string; groupName: string };
    link: string;
};

/**
 * Who has to be told about merging pending sub-categories: the owner of each group that carries one.
 * Two queries for any number of tags (pending tags with their groups, then all owners); call it
 * before the merge, which moves the groups to the canonical tag.
 */
async function collectMergeNotices(
    pendingIds: string[],
    canonical: { name: string; en: string; lv: string }
): Promise<{ foundIds: string[]; groupCount: number; notices: TagMergeNotice[] }> {
    const pendingTags = await prisma.category.findMany({
        where: { id: { in: pendingIds }, level: { in: [2, 3] }, status: 'PENDING_REVIEW' },
        select: {
            id: true,
            slug: true,
            titles: { select: { lang: true, title: true } },
            groupsWithTags: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    category: { include: { parent: { include: { parent: true } } } },
                },
            },
        },
    });

    const groupIds = pendingTags.flatMap((tag) => tag.groupsWithTags.map((group) => group.id));
    const owners = groupIds.length
        ? await prisma.membership.findMany({ where: { groupId: { in: groupIds }, role: 'OWNER' }, select: { groupId: true, userId: true } })
        : [];
    const ownerByGroup = new Map(owners.map((owner) => [owner.groupId, owner.userId]));

    const notices: TagMergeNotice[] = [];
    for (const tag of pendingTags) {
        const originalTag = tag.titles[0]?.title ?? tag.slug;
        for (const group of tag.groupsWithTags) {
            const userId = ownerByGroup.get(group.id);
            if (!userId) continue;
            notices.push({
                userId,
                args: { originalTag, canonicalTag: canonical.name, canonicalTagEn: canonical.en, canonicalTagLv: canonical.lv, groupName: group.name },
                link: `/${TaxonomyResolver.resolve(group.category).l1Slug}/group/${group.slug}/settings?tab=categorization`,
            });
        }
    }
    return { foundIds: pendingTags.map((tag) => tag.id), groupCount: groupIds.length, notices };
}

export const TaxonomyService = {
    // Level-agnostic taxonomy writes (L2 and L3) live in taxonomy-write.ts.
    createPending: TaxonomyWrite.createPending,
    createActive: TaxonomyWrite.createActive,
    approve: TaxonomyWrite.approve,
    merge: TaxonomyWrite.merge,
    withParentTopics: TaxonomyWrite.withParentTopics,

    async getTaxonomy(locale: string): Promise<TaxonomyTree> {
        const lang = locale === 'en' ? 'en' : 'lv';

        return unstable_cache(
            async () => {
                const allCategories = await prisma.category.findMany({
                    where: {
                        status: 'ACTIVE',
                    },
                    include: {
                        // All languages: a sub-category may have a title in one language only.
                        titles: { select: { lang: true, title: true } },
                        aliases: {
                            select: {
                                id: true,
                                value: true,
                                locale: true,
                                createdAt: true,
                            },
                            orderBy: [{ value: 'asc' }, { createdAt: 'desc' }],
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                });

                if (allCategories.length === 0) {
                    return [];
                }

                const getTitle = (cat: { titles: { lang: string; title: string }[]; slug: string }) =>
                    pickTitle(cat.titles, lang, cat.slug);

                const l1s = allCategories.filter((c) => c.level === 1);
                const l2s = allCategories.filter((c) => c.level === 2);
                const l3s = allCategories.filter((c) => c.level === 3);

                return l1s.map((l1): L1Category => {
                    const subcategories: L2Category[] = l2s
                        .filter((l2) => l2.parentId === l1.id)
                        .map((l2) => ({
                            id: l2.id,
                            slug: l2.slug,
                            slugLv: l2.slugLv,
                            title: getTitle(l2),
                            langs: (['lv', 'en'] as const).filter((code) => l2.titles.some((t) => t.lang === code && t.title.trim())),
                            status: l2.status,
                            image: categoryImage(l2),
                            tags: l3s
                                .filter((l3) => l3.parentId === l2.id)
                                .map((l3) => ({
                                    id: l3.id,
                                    slug: l3.slug,
                                    title: getTitle(l3),
                                    isWildcard: l3.isWildcard,
                                    status: l3.status,
                                    image: categoryImage(l3, l2),
                                })),
                        }));

                    return {
                        id: l1.id,
                        slug: l1.slug,
                        title: getTitle(l1),
                        color: categoryColor(l1.slug, l1.color),
                        storedColor: l1.color,
                        subcategories,
                        aliases: l1.aliases,
                    };
                });
            },
            [`taxonomy-${lang}`],
            {
                revalidate: 300,
                tags: ['categories'],
            }
        )();
    },

    async searchL2(query: string, l1Id: string, locale: string): Promise<L2SearchResult[]> {
        const normalized = query.trim();
        if (normalized.length < 2) {
            return [];
        }

        const lang = locale === 'en' ? 'en' : 'lv';

        const categories = await prisma.category.findMany({
            where: {
                status: 'ACTIVE',
                // Veidi under the L1 and the sub-veidi under those.
                AND: [{ OR: [{ level: 2, parentId: l1Id }, { level: 3, parent: { parentId: l1Id } }] }],
                OR: [
                    {
                        // Any language, so a sub-category named in one language only is still found.
                        titles: {
                            some: {
                                title: {
                                    contains: normalized,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                    {
                        aliases: {
                            some: {
                                value: {
                                    contains: normalized,
                                    mode: 'insensitive',
                                },
                                OR: [{ locale: null }, { locale: lang }],
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                slug: true,
                level: true,
                parentId: true,
                titles: { select: { lang: true, title: true } },
                aliases: {
                    where: {
                        value: {
                            contains: normalized,
                            mode: 'insensitive',
                        },
                        OR: [{ locale: null }, { locale: lang }],
                    },
                    select: { id: true },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 30,
        });

        return categories.flatMap((category) =>
            category.parentId
                ? [{
                    id: category.id,
                    slug: category.slug,
                    title: pickTitle(category.titles, lang, category.slug),
                    isAlias: category.aliases.length > 0,
                    level: category.level === 3 ? (3 as const) : (2 as const),
                    parentId: category.parentId,
                }]
                : []
        );
    },

    /**
     * Merges a pending sub-category into an existing one and returns the owners to notify.
     * Both language names are stored in the notice so each owner sees the tag in the language they read.
     */
    async mergePendingTag(pendingId: string, canonicalId: string, locale: string): Promise<{ affectedGroups: number; notices: TagMergeNotice[] }> {
        const canonical = await prisma.category.findUnique({
            where: { id: canonicalId },
            select: { slug: true, titles: { select: { lang: true, title: true } } },
        });
        if (!canonical) throw new ActionError('TAG_NOT_FOUND');
        const titleOf = (lang: 'en' | 'lv') => canonical.titles.find((title) => title.lang === lang)?.title ?? canonical.slug;
        const en = titleOf('en');
        const lv = titleOf('lv');

        const { foundIds, groupCount, notices } = await collectMergeNotices([pendingId], { name: locale === 'en' ? en : lv, en, lv });
        if (!foundIds.includes(pendingId)) throw new ActionError('TAG_NOT_FOUND');

        await TaxonomyWrite.merge(pendingId, canonicalId);
        return { affectedGroups: groupCount, notices };
    },

    async createAlias(params: { value: string; categoryId: string; locale?: string }): Promise<CategoryAlias> {
        const value = params.value.trim();
        if (value.length < 2) {
            throw new ActionError('VALIDATION_FAILED');
        }

        try {
            return await prisma.categoryAlias.create({
                data: {
                    value,
                    locale: params.locale ?? null,
                    categoryId: params.categoryId,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ActionError('ALIAS_CONFLICT');
            }
            throw error;
        }
    },

    async deleteAlias(id: string): Promise<void> {
        await prisma.categoryAlias.delete({ where: { id } });
    },

    /**
     * The one check for the tags a group may carry (create, owner edit, admin edit): at most
     * MAX_GROUP_TAGS (groups saved before the limit may keep theirs but not gain any), every tag
     * ACTIVE or a pending suggestion (wildcard, PENDING_REVIEW), and every tag under the group's main (L1)
     * category. Tags the group already has stay valid, but a foreign one only while the main category is
     * unchanged (`currentCategoryId`). Returns an error code, or null when the tags are fine.
     */
    async validateGroupTags(
        tagIds: string[],
        categoryId: string,
        opts: { currentTagIds?: string[]; currentCategoryId?: string } = {}
    ): Promise<'TAG_LIMIT_REACHED' | 'TAG_SUB_LIMIT' | 'TAG_NOT_FOUND' | 'TAG_CATEGORY_MISMATCH' | null> {
        const unique = Array.from(new Set(tagIds));
        const current = opts.currentTagIds ?? [];

        if (unique.length === 0) return null;

        const found = await prisma.category.findMany({
            where: {
                id: { in: unique },
                OR: [
                    { status: 'ACTIVE' },
                    { id: { in: current } },
                    // Suggestions waiting for review. A reused suggestion (same name already pending) belongs to its
                    // first submitter, so the submitter cannot be required to be the group's creator.
                    { status: 'PENDING_REVIEW' as const, isWildcard: true },
                ],
            },
            select: { id: true, level: true, parentId: true, parent: { select: { parentId: true } } },
        });
        if (found.length !== unique.length) return 'TAG_NOT_FOUND';

        // Veidi and sub-veidi count apart; a legacy group may keep what it had per level but not gain any.
        const currentLevels = await prisma.category.findMany({ where: { id: { in: current } }, select: { level: true } });
        const topicCount = found.filter((tag) => tag.level === 2).length;
        const subCount = found.filter((tag) => tag.level === 3).length;
        if (topicCount > MAX_GROUP_TAGS && topicCount > currentLevels.filter((t) => t.level === 2).length) return 'TAG_LIMIT_REACHED';
        if (subCount > MAX_GROUP_SUBTAGS && subCount > currentLevels.filter((t) => t.level === 3).length) return 'TAG_SUB_LIMIT';
        // Every sub-veids needs its Veids in the set (withParentTopics makes sure of it; this guards direct callers).
        const ids = new Set(unique);
        if (found.some((tag) => tag.level === 3 && (!tag.parentId || !ids.has(tag.parentId)))) return 'TAG_CATEGORY_MISMATCH';

        const l1Id = await TaxonomyService.getL1Id(categoryId);
        if (!l1Id) return 'TAG_NOT_FOUND';
        const keepsForeign = opts.currentCategoryId === categoryId;
        const mismatch = found.some((tag) => {
            const tagL1Id = tag.level === 3 ? tag.parent?.parentId : tag.parentId;
            if (tagL1Id === l1Id) return false;
            return !(keepsForeign && current.includes(tag.id));
        });
        return mismatch ? 'TAG_CATEGORY_MISMATCH' : null;
    },

    /** The top-level (L1) category a category sits under (older groups may have an L2 as their category). */
    async getL1Id(categoryId: string): Promise<string | null> {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, level: true, parentId: true, parent: { select: { parentId: true } } },
        });
        if (!category) return null;
        if (category.level === 1) return category.id;
        return category.level === 2 ? category.parentId : category.parent?.parentId ?? null;
    },

    /**
     * Pending sub-categories the picker may show under an L1: those chosen by two or more different
     * people (owners of groups carrying the tag, counted once per person however many groups they have),
     * plus the ones in `selectedIds` (a person always sees what they picked themselves).
     * `isPublic` tells the two apart, so a shared suggestion can still be styled as unconfirmed.
     */
    async getPendingTagOptions(l1Id: string, selectedIds: string[], locale: string): Promise<PendingTagOption[]> {
        const lang = locale === 'en' ? 'en' : 'lv';
        const pending = await prisma.category.findMany({
            where: {
                OR: [{ parentId: l1Id, level: 2 }, { level: 3, parent: { parentId: l1Id, status: 'ACTIVE' } }],
                status: 'PENDING_REVIEW',
                isWildcard: true,
            },
            select: {
                id: true,
                slug: true,
                level: true,
                parentId: true,
                titles: { select: { lang: true, title: true } },
                groupsWithTags: { select: { members: { where: { role: 'OWNER' }, select: { userId: true } } } },
            },
            orderBy: { createdAt: 'asc' },
        });

        return pending.flatMap((tag) => {
            const supporters = new Set(tag.groupsWithTags.flatMap((group) => group.members.map((member) => member.userId)));
            const isPublic = supporters.size >= MIN_PENDING_TAG_SUPPORTERS;
            if (!isPublic && !selectedIds.includes(tag.id)) return [];
            const title = pickTitle(tag.titles, lang, tag.slug);
            if (!tag.parentId) return [];
            return [{ id: tag.id, slug: tag.slug, title, isPublic, level: tag.level === 3 ? (3 as const) : (2 as const), parentId: tag.parentId }];
        });
    },

    /**
     * A group's primary category must be an active top-level (L1) category, which is all the wizard offers.
     * A group keeps a category it already has (older groups may sit under an L2).
     */
    async isValidPrimaryCategory(categoryId: string, currentCategoryId?: string): Promise<boolean> {
        if (currentCategoryId && categoryId === currentCategoryId) return true;
        const category = await prisma.category.findFirst({
            where: { id: categoryId, level: 1, status: 'ACTIVE' },
            select: { id: true },
        });
        return !!category;
    },

    async adminUpdateGroupTags(groupId: string, tagIds: string[]): Promise<{ slug: string; l1Slug: string }> {
        const uniqueTagIds = await TaxonomyWrite.withParentTopics(tagIds);

        const current = await prisma.group.findUnique({
            where: { id: groupId },
            select: { slug: true, categoryId: true, category: { include: { parent: { include: { parent: true } } } }, tags: { select: { id: true } } }
        });
        if (!current) throw new ActionError('NOT_FOUND');
        const error = await TaxonomyService.validateGroupTags(uniqueTagIds, current.categoryId, {
            currentTagIds: current.tags.map((t) => t.id),
            currentCategoryId: current.categoryId,
        });
        if (error) throw new ActionError(error);

        await prisma.group.update({
            where: { id: groupId },
            data: {
                tags: {
                    set: uniqueTagIds.map((id) => ({ id })),
                },
            },
        });
        return { slug: current.slug, l1Slug: TaxonomyResolver.resolve(current.category).l1Slug };
    },

    async getPendingCategories(): Promise<PendingCategoryWithContext[]> {
        const categories = await prisma.category.findMany({
            where: {
                level: { in: [2, 3] },
                status: 'PENDING_REVIEW',
            },
            include: {
                titles: {
                    orderBy: { lang: 'asc' },
                    select: { lang: true, title: true },
                },
                parent: {
                    include: {
                        titles: { select: { lang: true, title: true } },
                        parent: { include: { titles: { select: { lang: true, title: true } } } },
                    },
                },
                submittedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
                groupsWithTags: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        category: {
                            select: {
                                slug: true,
                                level: true,
                                parent: {
                                    select: {
                                        slug: true,
                                        parent: {
                                            select: { slug: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        });

        return categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            submittedAt: category.submittedAt,
            submittedLabel: category.titles[0]?.title ?? category.slug,
            submittedLang: category.titles[0]?.lang === 'lv' ? 'lv' : 'en',
            level: category.level,
            grandparentTitle: category.parent?.parent
                ? category.parent.parent.titles.find((title) => title.lang === 'en')?.title ?? category.parent.parent.slug
                : null,
            parent: category.parent
                ? {
                    id: category.parent.id,
                    slug: category.parent.slug,
                    title: category.parent.titles.find((title) => title.lang === 'en')?.title ?? category.parent.slug,
                }
                : null,
            submitter: category.submittedBy
                ? {
                    id: category.submittedBy.id,
                    username: category.submittedBy.username,
                    name: category.submittedBy.name,
                }
                : null,
            groups: category.groupsWithTags.map((group) => ({
                id: group.id,
                name: group.name,
                slug: group.slug,
                l1Slug:
                    group.category.level === 1
                        ? group.category.slug
                        : group.category.level === 2
                            ? group.category.parent?.slug ?? group.category.slug
                            : group.category.parent?.parent?.slug ?? group.category.slug,
            })),
        }));
    },



    async updateL1Category(id: string, color: string): Promise<void> {
        const category = await prisma.category.findUnique({
            where: { id },
            select: { level: true },
        });

        if (!category || category.level !== 1) {
            throw new ActionError('TAG_NOT_FOUND');
        }

        await prisma.category.update({
            where: { id },
            data: { color },
        });
    },

    async getAllL2Categories(): Promise<ActiveL2WithAliases[]> {
        const categories = await prisma.category.findMany({
            where: {
                level: { in: [2, 3] },
                status: 'ACTIVE',
            },
            include: {
                titles: {
                    select: {
                        lang: true,
                        title: true,
                    },
                    orderBy: { lang: 'asc' },
                },
                aliases: {
                    select: {
                        id: true,
                        value: true,
                        locale: true,
                        createdAt: true,
                    },
                    orderBy: [{ value: 'asc' }, { createdAt: 'desc' }],
                },
                parent: {
                    select: {
                        id: true,
                        slug: true,
                    },
                },
            },
            orderBy: { slug: 'asc' },
        });

        return categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            slugLv: category.slugLv,
            level: category.level,
            parentId: category.parentId,
            parentSlug: category.parent?.slug ?? null,
            translations: category.titles,
            aliases: category.aliases,
        }));
    },

    async bulkApprovePending(ids: string[]): Promise<number> {
        const pending = await prisma.category.findMany({
            where: { id: { in: ids }, status: 'PENDING_REVIEW', level: { in: [2, 3] } },
            include: { titles: true }
        });

        let approvedCount = 0;
        for (const cat of pending) {
            const titleEn = cat.titles.find(t => t.lang === 'en')?.title || cat.titles[0]?.title || cat.slug;
            const slugEn = await createUniqueCategorySlug(titleEn);
            const slugLv = slugify(titleEn) || `tag-lv-${Date.now()}`;

            // The suggestion keeps the one language it was written in; the other stays missing until an
            // admin adds it (viewers of that language see the original through pickTitle meanwhile).
            await prisma.category.update({
                where: { id: cat.id },
                data: {
                    status: 'ACTIVE',
                    isWildcard: false,
                    slug: slugEn,
                    slugLv,
                }
            });
            approvedCount++;
        }
        return approvedCount;
    },

    async bulkDelete(ids: string[]): Promise<void> {
        if (!ids.length) return;
        await prisma.category.deleteMany({
            where: {
                id: { in: ids },
                level: { in: [2, 3] },
            },
        });
    },

    /** Bulk merge plus the owners to notify (see mergePendingTag). Notices cover only the ids that were pending. */
    async bulkMergeWithNotices(
        canonicalId: string,
        mergedIds: string[],
        canonicalUpdates: { nameEn: string; nameLv: string; slugEn: string; slugLv: string }
    ): Promise<TagMergeNotice[]> {
        // The canonical names after the update are the ones owners should see; the English one is the fallback.
        const { notices } = await collectMergeNotices(mergedIds, { name: canonicalUpdates.nameEn, en: canonicalUpdates.nameEn, lv: canonicalUpdates.nameLv });
        await TaxonomyService.bulkMerge(canonicalId, mergedIds, canonicalUpdates);
        return notices;
    },

    async bulkMerge(canonicalId: string, mergedIds: string[], canonicalUpdates: { nameEn: string; nameLv: string; slugEn: string; slugLv: string }): Promise<void> {
        if (!mergedIds.length) throw new ActionError('VALIDATION_FAILED');
        if (mergedIds.includes(canonicalId)) throw new ActionError('VALIDATION_FAILED');

        return prisma.$transaction(async (tx) => {
            const allIds = [canonicalId, ...mergedIds];
            const tags = await tx.category.findMany({
                where: { id: { in: allIds }, level: { in: [2, 3] } },
                include: { titles: { take: 1 } }
            });

            if (tags.length !== allIds.length) {
                throw new ActionError('TAG_NOT_FOUND');
            }
            // Siblings only: one level and one parent.
            if (tags.some((tag) => tag.level !== tags[0].level || tag.parentId !== tags[0].parentId)) {
                throw new ActionError('TAG_LEVEL_INVALID');
            }

            // 1. Update Canonical
            await tx.category.update({
                where: { id: canonicalId },
                data: {
                    status: 'ACTIVE',
                    isWildcard: false,
                    slug: canonicalUpdates.slugEn,
                    slugLv: canonicalUpdates.slugLv,
                },
            });

            await tx.categoryTranslation.upsert({
                where: { categoryId_lang: { categoryId: canonicalId, lang: 'en' } },
                update: { title: canonicalUpdates.nameEn },
                create: { categoryId: canonicalId, lang: 'en', title: canonicalUpdates.nameEn },
            });

            await tx.categoryTranslation.upsert({
                where: { categoryId_lang: { categoryId: canonicalId, lang: 'lv' } },
                update: { title: canonicalUpdates.nameLv },
                create: { categoryId: canonicalId, lang: 'lv', title: canonicalUpdates.nameLv },
            });

            // Each merged tag hands over its groups (D3 kept), notes, hub cities, name and sub-veidi, then goes.
            for (const id of mergedIds) await TaxonomyWrite.mergeInto(tx, id, canonicalId);
        });
    },
};
