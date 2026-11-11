import { ActionError } from '@/types/actions';
import { Prisma, Category } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { moveHubCities } from './hub-city-merge';

/** A Veids slug may not equal an ACTIVE city's address segment (K3-03): the category would shadow the city hub, so the slug counts as taken. */
export async function takenByCity(slug: string): Promise<boolean> {
    return (await prisma.city.count({ where: { status: 'ACTIVE', slug: { equals: slug, mode: 'insensitive' } } })) > 0;
}

export async function createUniqueCategorySlug(baseLabel: string): Promise<string> {
    const baseSlug = slugify(baseLabel);
    if (!baseSlug) {
        return `tag-${Date.now()}`;
    }

    const exact = await prisma.category.findUnique({ where: { slug: baseSlug }, select: { id: true } });
    if (!exact && !(await takenByCity(baseSlug))) {
        return baseSlug;
    }

    let suffix = 2;
    while (true) {
        const candidate = `${baseSlug}-${suffix}`;
        const exists = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
        if (!exists && !(await takenByCity(candidate))) {
            return candidate;
        }
        suffix += 1;
    }
}

/**
 * The level a new child gets from its parent: under an L1 a Veids (2), under an ACTIVE L2 a sub-veids (3).
 * Anything else (an L3 parent, a missing or inactive parent) is refused, so the taxonomy never grows a fourth level.
 */
async function childLevelOf(parentId: string): Promise<2 | 3> {
    const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { level: true, status: true } });
    if (!parent || parent.status !== 'ACTIVE') throw new ActionError('TAG_NOT_FOUND');
    if (parent.level === 1) return 2;
    if (parent.level === 2) return 3;
    throw new ActionError('TAG_LEVEL_INVALID');
}

/**
 * D3: a group with a sub-veids always carries its Veids. Adds the parent of every L3 id (each parent
 * before its children, deduped). Every write of `Group.tags` runs its ids through this first.
 */
export async function withParentTopics(tagIds: string[]): Promise<string[]> {
    const unique = Array.from(new Set(tagIds));
    if (unique.length === 0) return unique;
    const subs = await prisma.category.findMany({ where: { id: { in: unique }, level: 3 }, select: { id: true, parentId: true } });
    const parentOf = new Map(subs.map((sub) => [sub.id, sub.parentId]));
    const out: string[] = [];
    const push = (id: string) => { if (!out.includes(id)) out.push(id); };
    for (const id of unique) {
        const parentId = parentOf.get(id);
        if (parentId) push(parentId);
        push(id);
    }
    return out;
}

/** `created` is false when an existing pending tag with the same name was reused. */
export async function createPending(params: { label: string; parentId: string; submittedById: string; locale: string }): Promise<{ category: Category; created: boolean }> {
    const trimmed = params.label.trim();
    if (trimmed.length < 2) {
        throw new ActionError('VALIDATION_FAILED');
    }
    const level = await childLevelOf(params.parentId);
    if (level === 3 && (await takenByCity(slugify(trimmed)))) throw new ActionError('TAG_ALREADY_EXISTS');

    // Two people suggesting the same name at once must end with one pending tag: a transaction-scoped
    // advisory lock keyed on parent + lower-cased name makes the second one wait, then find the first.
    return prisma.$transaction(async (tx) => {
        const lockKey = `pending-topic:${params.parentId}:${trimmed.toLowerCase()}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;

        // Someone (maybe in another session) may have suggested the same name already: reuse it instead of a second pending tag.
        const existing = await tx.category.findFirst({
            where: {
                parentId: params.parentId,
                level,
                isWildcard: true,
                status: 'PENDING_REVIEW',
                titles: { some: { title: { equals: trimmed, mode: 'insensitive' } } },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (existing) return { category: existing, created: false };

        const slug = await createUniqueCategorySlug(trimmed);

        const category = await tx.category.create({
            data: {
                slug,
                level,
                parentId: params.parentId,
                isWildcard: true,
                status: 'PENDING_REVIEW',
                submittedById: params.submittedById,
                submittedAt: new Date(),
                titles: {
                    // Stored in the language the person typed it in; an admin adds the other language later.
                    create: { lang: params.locale === 'en' ? 'en' : 'lv', title: trimmed },
                },
            },
        });
        return { category, created: true };
    });
}

export async function createActive(params: { parentId: string; nameEn: string; nameLv: string }): Promise<Category> {
    const nameEn = params.nameEn.trim();
    const nameLv = params.nameLv.trim();

    if (nameEn.length < 2 || nameLv.length < 2) {
        throw new ActionError('VALIDATION_FAILED');
    }
    const level = await childLevelOf(params.parentId);
    if (level === 3 && (await takenByCity(slugify(nameEn)))) throw new ActionError('TAG_ALREADY_EXISTS');

    const slugEn = await createUniqueCategorySlug(nameEn);
    const slugLv = slugify(nameLv) || `tag-lv-${Date.now()}`;

    return prisma.category.create({
        data: {
            slug: slugEn,
            slugLv,
            level,
            parentId: params.parentId,
            isWildcard: false,
            status: 'ACTIVE',
            titles: { createMany: { data: [{ lang: 'en', title: nameEn }, { lang: 'lv', title: nameLv }] } },
        },
    });
}

export async function approve(id: string, params: { nameEn: string; nameLv: string; slugEn: string; slugLv: string }): Promise<Category> {
    const category = await prisma.category.findUnique({ where: { id }, select: { id: true, level: true } });

    if (!category || (category.level !== 2 && category.level !== 3)) {
        throw new ActionError('TAG_NOT_FOUND');
    }

    // Slugs follow the names, so two names can land on one slug: say so instead of failing on the unique index.
    const clash = await prisma.category.findFirst({
        where: { id: { not: id }, OR: [{ slug: params.slugEn }, { slugLv: params.slugLv }] },
        select: { id: true },
    });
    if (clash || await takenByCity(params.slugEn)) throw new ActionError('TAG_ALREADY_EXISTS');

    return prisma.$transaction(async (tx) => {
        const updated = await tx.category.update({
            where: { id },
            data: { status: 'ACTIVE', isWildcard: false, slug: params.slugEn, slugLv: params.slugLv },
        });
        for (const [lang, title] of [['en', params.nameEn], ['lv', params.nameLv]] as const) {
            await tx.categoryTranslation.upsert({
                where: { categoryId_lang: { categoryId: id, lang } },
                update: { title },
                create: { categoryId: id, lang, title },
            });
        }
        return updated;
    });
}

/** Moves one category's groups, notes, hub cities and name into its canonical sibling and deletes it; children move first. */
export async function mergeInto(tx: Prisma.TransactionClient, pendingId: string, canonicalId: string, children = false): Promise<void> {
    const [pending, canonical] = await Promise.all([
        tx.category.findUnique({
            where: { id: pendingId },
            include: { titles: { select: { lang: true, title: true } }, children: { include: { titles: { select: { title: true } } } } },
        }),
        tx.category.findUnique({
            where: { id: canonicalId },
            select: { id: true, parentId: true, level: true, status: true, children: { select: { id: true, titles: { select: { title: true } } } } },
        }),
    ]);

    if (!pending || (pending.level !== 2 && pending.level !== 3)) throw new ActionError('TAG_NOT_FOUND');
    if (!canonical || canonical.level !== pending.level || canonical.status !== 'ACTIVE') throw new ActionError('TAG_NOT_FOUND');
    // Siblings only: an L3 merges into another sub-veids of the same Veids, an L2 into a Veids of the same L1.
    if (!children && pending.parentId !== canonical.parentId) throw new ActionError('TAG_LEVEL_INVALID');

    // An L2 hands its sub-veidi to the canonical; one with the same name there is merged into it instead.
    for (const child of pending.children) {
        const names = child.titles.map((t) => t.title.trim().toLowerCase());
        const twin = canonical.children.find((c) => c.titles.some((t) => names.includes(t.title.trim().toLowerCase())));
        if (twin) await mergeInto(tx, child.id, twin.id, true);
        else await tx.category.update({ where: { id: child.id }, data: { parentId: canonicalId } });
    }

    // Ziņas sit on the Veids and would be cascade-deleted with it: move them first (K2 Risk 1).
    await tx.hubNote.updateMany({ where: { categoryId: pendingId }, data: { categoryId: canonicalId } });
    await moveHubCities(tx, [pendingId], canonicalId);

    const groups = await tx.group.findMany({
        where: { tags: { some: { id: pendingId } } },
        select: { id: true, tags: { where: { id: { in: [pendingId, canonicalId] } }, select: { id: true } } },
    });
    for (const group of groups) {
        const hasCanonical = group.tags.some((tag) => tag.id === canonicalId);
        // D3: a group that now carries a sub-veids also carries its Veids.
        const connect = [
            ...(hasCanonical ? [] : [{ id: canonicalId }]),
            ...(canonical.level === 3 && canonical.parentId ? [{ id: canonical.parentId }] : []),
        ];
        await tx.group.update({
            where: { id: group.id },
            data: { tags: { disconnect: { id: pendingId }, ...(connect.length ? { connect } : {}) } },
        });
    }

    const pendingLabel = pending.titles[0]?.title?.trim();
    if (pendingLabel) {
        try {
            await tx.categoryAlias.create({
                data: { value: pendingLabel, locale: pending.titles[0]?.lang === 'lv' ? 'lv' : 'en', categoryId: canonicalId },
            });
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
        }
    }

    await tx.category.delete({ where: { id: pendingId } });
}

export async function merge(pendingId: string, canonicalId: string): Promise<void> {
    if (pendingId === canonicalId) throw new ActionError('VALIDATION_FAILED');
    await prisma.$transaction((tx) => mergeInto(tx, pendingId, canonicalId));
}
