import { ActionError } from '@/types/actions';
import { Prisma, Category, CategoryAlias } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { MAX_GROUP_TAGS, MIN_PENDING_TAG_SUPPORTERS } from '@/lib/constants';

export type L3Tag = {
    id: string;
    slug: string;
    title: string;
    isWildcard: boolean;
    status: 'ACTIVE' | 'PENDING_REVIEW';
};

export type L2Category = {
    id: string;
    slug: string;
    slugLv: string | null;
    title: string;
    status: 'ACTIVE' | 'PENDING_REVIEW';
    tags: L3Tag[];
};

export type L1Category = {
    id: string;
    slug: string;
    title: string;
    color: string;
    subcategories: L2Category[];
    aliases: Array<{ id: string; value: string; locale: string | null; createdAt: Date }>;
};

export type TaxonomyTree = L1Category[];

export type L2SearchResult = {
    id: string;
    slug: string;
    title: string;
    isAlias: boolean;
};

/** A pending sub-category the tag picker may offer. */
export type PendingTagOption = {
    id: string;
    slug: string;
    title: string;
    /** Chosen by enough different people to be offered to everyone. */
    isPublic: boolean;
};

export type PendingCategoryWithContext = {
    id: string;
    slug: string;
    submittedAt: Date | null;
    submittedLabel: string;
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
    parentId: string | null;
    parentSlug: string | null;
    translations: Array<{ lang: string; title: string }>;
    aliases: Array<{ id: string; value: string; locale: string | null; createdAt: Date }>;
};

async function createUniqueCategorySlug(baseLabel: string): Promise<string> {
    const baseSlug = slugify(baseLabel);
    if (!baseSlug) {
        return `tag-${Date.now()}`;
    }

    const exact = await prisma.category.findUnique({ where: { slug: baseSlug }, select: { id: true } });
    if (!exact) {
        return baseSlug;
    }

    let suffix = 2;
    while (true) {
        const candidate = `${baseSlug}-${suffix}`;
        const exists = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
        if (!exists) {
            return candidate;
        }
        suffix += 1;
    }
}

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
        where: { id: { in: pendingIds }, level: 2, status: 'PENDING_REVIEW' },
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
        const originalTag = tag.titles.find((title) => title.lang === 'en')?.title ?? tag.titles[0]?.title ?? tag.slug;
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
    async getTaxonomy(locale: string): Promise<TaxonomyTree> {
        const lang = locale === 'en' ? 'en' : 'lv';

        return unstable_cache(
            async () => {
                const allCategories = await prisma.category.findMany({
                    where: {
                        status: 'ACTIVE',
                    },
                    include: {
                        titles: {
                            where: { lang },
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
                    },
                    orderBy: { createdAt: 'asc' },
                });

                if (allCategories.length === 0) {
                    return [];
                }

                const getTitle = (cat: { titles: { title: string }[]; slug: string }) =>
                    cat.titles[0]?.title ?? cat.slug;

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
                            status: l2.status,
                            tags: l3s
                                .filter((l3) => l3.parentId === l2.id)
                                .map((l3) => ({
                                    id: l3.id,
                                    slug: l3.slug,
                                    title: getTitle(l3),
                                    isWildcard: l3.isWildcard,
                                    status: l3.status,
                                })),
                        }));

                    return {
                        id: l1.id,
                        slug: l1.slug,
                        title: getTitle(l1),
                        color: l1.color ?? '#6366f1',
                        subcategories,
                        aliases: l1.aliases,
                    };
                });
            },
            [`taxonomy-${lang}`],
            {
                revalidate: 3600,
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
                level: 2,
                parentId: l1Id,
                status: 'ACTIVE',
                OR: [
                    {
                        titles: {
                            some: {
                                lang,
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
                titles: {
                    where: { lang },
                    select: { title: true },
                    take: 1,
                },
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

        return categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            title: category.titles[0]?.title ?? category.slug,
            isAlias: category.aliases.length > 0,
        }));
    },

    /** `created` is false when an existing pending tag with the same name was reused. */
    async createPendingL2(params: { label: string; parentId: string; submittedById: string }): Promise<{ category: Category; created: boolean }> {
        const trimmed = params.label.trim();
        if (trimmed.length < 2) {
            throw new ActionError('VALIDATION_FAILED');
        }

        const parent = await prisma.category.findUnique({
            where: { id: params.parentId },
            select: { id: true, level: true, status: true },
        });

        if (!parent || parent.level !== 1 || parent.status !== 'ACTIVE') {
            throw new ActionError('TAG_NOT_FOUND');
        }

        // Someone (maybe in another session) may have suggested the same name already: reuse it instead of a second pending tag.
        const existing = await prisma.category.findFirst({
            where: {
                parentId: params.parentId,
                level: 2,
                isWildcard: true,
                status: 'PENDING_REVIEW',
                titles: { some: { title: { equals: trimmed, mode: 'insensitive' } } },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (existing) return { category: existing, created: false };

        const slug = await createUniqueCategorySlug(trimmed);

        const category = await prisma.category.create({
            data: {
                slug,
                level: 2,
                parentId: params.parentId,
                isWildcard: true,
                status: 'PENDING_REVIEW',
                submittedById: params.submittedById,
                submittedAt: new Date(),
                titles: {
                    create: {
                        lang: 'en',
                        title: trimmed,
                    },
                },
            },
        });
        return { category, created: true };
    },

    async createActiveL2(params: { parentId: string; nameEn: string; nameLv: string }): Promise<Category> {
        const nameEn = params.nameEn.trim();
        const nameLv = params.nameLv.trim();

        if (nameEn.length < 2 || nameLv.length < 2) {
            throw new ActionError('VALIDATION_FAILED');
        }

        const parent = await prisma.category.findUnique({
            where: { id: params.parentId },
            select: { id: true, level: true, status: true },
        });

        if (!parent || parent.level !== 1 || parent.status !== 'ACTIVE') {
            throw new ActionError('TAG_NOT_FOUND');
        }

        const slugEn = await createUniqueCategorySlug(nameEn);
        const slugLv = slugify(nameLv) || `tag-lv-${Date.now()}`;

        return prisma.category.create({
            data: {
                slug: slugEn,
                slugLv,
                level: 2,
                parentId: params.parentId,
                isWildcard: false,
                status: 'ACTIVE',
                titles: {
                    createMany: {
                        data: [
                            { lang: 'en', title: nameEn },
                            { lang: 'lv', title: nameLv },
                        ],
                    },
                },
            },
        });
    },

    async approveL2(id: string, params: { nameEn: string; nameLv: string; slugEn: string; slugLv: string }): Promise<Category> {
        const category = await prisma.category.findUnique({
            where: { id },
            select: { id: true, level: true },
        });

        if (!category || category.level !== 2) {
            throw new ActionError('TAG_NOT_FOUND');
        }

        return prisma.$transaction(async (tx) => {
            const updated = await tx.category.update({
                where: { id },
                data: {
                    status: 'ACTIVE',
                    isWildcard: false,
                    slug: params.slugEn,
                    slugLv: params.slugLv,
                },
            });

            await tx.categoryTranslation.upsert({
                where: {
                    categoryId_lang: {
                        categoryId: id,
                        lang: 'en',
                    },
                },
                update: {
                    title: params.nameEn,
                },
                create: {
                    categoryId: id,
                    lang: 'en',
                    title: params.nameEn,
                },
            });

            await tx.categoryTranslation.upsert({
                where: {
                    categoryId_lang: {
                        categoryId: id,
                        lang: 'lv',
                    },
                },
                update: {
                    title: params.nameLv,
                },
                create: {
                    categoryId: id,
                    lang: 'lv',
                    title: params.nameLv,
                },
            });

            return updated;
        });
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

        await TaxonomyService.mergeL2(pendingId, canonicalId);
        return { affectedGroups: groupCount, notices };
    },

    async mergeL2(pendingId: string, canonicalId: string): Promise<void> {
        if (pendingId === canonicalId) {
            throw new ActionError('VALIDATION_FAILED');
        }

        await prisma.$transaction(async (tx) => {
            const [pending, canonical] = await Promise.all([
                tx.category.findUnique({
                    where: { id: pendingId },
                    include: {
                        titles: {
                            where: { lang: 'en' },
                            select: { title: true },
                            take: 1,
                        },
                    },
                }),
                tx.category.findUnique({
                    where: { id: canonicalId },
                    select: { id: true, parentId: true, level: true, status: true },
                }),
            ]);

            if (!pending || pending.level !== 2) {
                throw new ActionError('TAG_NOT_FOUND');
            }
            if (!canonical || canonical.level !== 2 || canonical.status !== 'ACTIVE') {
                throw new ActionError('TAG_NOT_FOUND');
            }
            if (pending.parentId !== canonical.parentId) {
                throw new ActionError('VALIDATION_FAILED');
            }

            const groups = await tx.group.findMany({
                where: {
                    tags: {
                        some: { id: pendingId },
                    },
                },
                select: {
                    id: true,
                    tags: {
                        where: {
                            id: {
                                in: [pendingId, canonicalId],
                            },
                        },
                        select: { id: true },
                    },
                },
            });

            for (const group of groups) {
                const hasCanonical = group.tags.some((tag) => tag.id === canonicalId);
                if (hasCanonical) {
                    await tx.group.update({
                        where: { id: group.id },
                        data: {
                            tags: {
                                disconnect: { id: pendingId },
                            },
                        },
                    });
                } else {
                    await tx.group.update({
                        where: { id: group.id },
                        data: {
                            tags: {
                                disconnect: { id: pendingId },
                                connect: { id: canonicalId },
                            },
                        },
                    });
                }
            }

            const pendingLabel = pending.titles[0]?.title?.trim();
            if (pendingLabel) {
                try {
                    await tx.categoryAlias.create({
                        data: {
                            value: pendingLabel,
                            locale: 'en',
                            categoryId: canonicalId,
                        },
                    });
                } catch (error) {
                    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
                        throw error;
                    }
                }
            }

            await tx.category.delete({ where: { id: pendingId } });
        });
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
    ): Promise<'TAG_LIMIT_REACHED' | 'TAG_NOT_FOUND' | 'TAG_CATEGORY_MISMATCH' | null> {
        const unique = Array.from(new Set(tagIds));
        const current = opts.currentTagIds ?? [];

        if (unique.length > MAX_GROUP_TAGS && unique.length > current.length) {
            return 'TAG_LIMIT_REACHED';
        }
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
            where: { parentId: l1Id, level: 2, status: 'PENDING_REVIEW', isWildcard: true },
            select: {
                id: true,
                slug: true,
                titles: { select: { lang: true, title: true } },
                groupsWithTags: { select: { members: { where: { role: 'OWNER' }, select: { userId: true } } } },
            },
            orderBy: { createdAt: 'asc' },
        });

        return pending.flatMap((tag) => {
            const supporters = new Set(tag.groupsWithTags.flatMap((group) => group.members.map((member) => member.userId)));
            const isPublic = supporters.size >= MIN_PENDING_TAG_SUPPORTERS;
            if (!isPublic && !selectedIds.includes(tag.id)) return [];
            const title = tag.titles.find((t) => t.lang === lang)?.title ?? tag.titles[0]?.title ?? tag.slug;
            return [{ id: tag.id, slug: tag.slug, title, isPublic }];
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
        const uniqueTagIds = Array.from(new Set(tagIds));

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
                level: 2,
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
            submittedLabel: category.titles.find((title) => title.lang === 'en')?.title ?? category.titles[0]?.title ?? category.slug,
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
                level: 2,
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
            parentId: category.parentId,
            parentSlug: category.parent?.slug ?? null,
            translations: category.titles,
            aliases: category.aliases,
        }));
    },

    async bulkApprovePending(ids: string[]): Promise<number> {
        const pending = await prisma.category.findMany({
            where: { id: { in: ids }, status: 'PENDING_REVIEW', level: 2 },
            include: { titles: true }
        });

        let approvedCount = 0;
        for (const cat of pending) {
            const titleEn = cat.titles.find(t => t.lang === 'en')?.title || cat.slug;
            const slugEn = await createUniqueCategorySlug(titleEn);
            const slugLv = slugify(titleEn) || `tag-lv-${Date.now()}`;

            await prisma.$transaction(async (tx) => {
                await tx.category.update({
                    where: { id: cat.id },
                    data: {
                        status: 'ACTIVE',
                        isWildcard: false,
                        slug: slugEn,
                        slugLv,
                    }
                });

                await tx.categoryTranslation.upsert({
                    where: { categoryId_lang: { categoryId: cat.id, lang: 'lv' } },
                    update: { title: titleEn },
                    create: { categoryId: cat.id, lang: 'lv', title: titleEn }
                });
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
                level: 2,
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
                where: { id: { in: allIds }, level: 2 },
                include: { titles: { where: { lang: 'en' }, take: 1 } }
            });

            if (tags.length !== allIds.length) {
                throw new ActionError('TAG_NOT_FOUND');
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

            // 2. Map group relationships
            const groups = await tx.group.findMany({
                where: { tags: { some: { id: { in: mergedIds } } } },
                select: { id: true, tags: { select: { id: true } } },
            });

            for (const group of groups) {
                const groupTags = group.tags.map(t => t.id);
                const hasCanonical = groupTags.includes(canonicalId);
                const tagsToRemove = mergedIds.filter(id => groupTags.includes(id));

                if (tagsToRemove.length === 0) continue;

                if (hasCanonical) {
                    await tx.group.update({
                        where: { id: group.id },
                        data: { tags: { disconnect: tagsToRemove.map(id => ({ id })) } }
                    });
                } else {
                    await tx.group.update({
                        where: { id: group.id },
                        data: {
                            tags: {
                                disconnect: tagsToRemove.map(id => ({ id })),
                                connect: { id: canonicalId }
                            }
                        }
                    });
                }
            }

            // 3. Create aliases for merged tags
            for (const tag of tags) {
                if (tag.id === canonicalId) continue;
                const titleEn = tag.titles[0]?.title?.trim();
                if (titleEn) {
                    try {
                        await tx.categoryAlias.create({
                            data: {
                                value: titleEn,
                                locale: 'en',
                                categoryId: canonicalId,
                            }
                        });
                    } catch (error) {
                        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
                            throw error;
                        }
                    }
                }
            }

            // 4. Delete merged tags
            await tx.category.deleteMany({
                where: { id: { in: mergedIds } }
            });
        });
    },
};
