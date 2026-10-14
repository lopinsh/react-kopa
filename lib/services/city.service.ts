import { ActionError } from '@/types/actions';
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { TaxonomyResolver } from './taxonomy-resolver.service';

export const CITIES_TAG = 'cities';

export type CityLang = 'lv' | 'en';

export interface CityOption {
    slug: string;
    /** Name in the requested language. */
    name: string;
}

export interface CityRow {
    id: string;
    slug: string;
    nameLv: string;
    nameEn: string;
    status: 'ACTIVE' | 'PENDING_REVIEW';
    submittedAt: Date | null;
    submittedBy: { username: string | null; name: string | null } | null;
    groupCount: number;
}

export interface CityGroup {
    id: string;
    name: string;
    slug: string;
    l1Slug: string;
    ownerIds: string[];
}

const lang = (locale: string): CityLang => (locale === 'en' ? 'en' : 'lv');

/** The stored value for a city: ASCII letters, digits and hyphens, each word capitalised (like the first ten). */
function citySlugBase(name: string): string {
    const base = slugify(name)
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    return base || 'City';
}

/** Same name as typed, ignoring case but not diacritics (the way pending tags are compared). */
function sameNameWhere(name: string): Prisma.CityWhereInput {
    return {
        OR: [
            { nameLv: { equals: name, mode: 'insensitive' } },
            { nameEn: { equals: name, mode: 'insensitive' } },
        ],
    };
}

function isUniqueViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

/**
 * Cached: every request needs the names (they are merged into the `cities` messages, which reach every page).
 * A pending city is included only once a group uses it, so a suggestion that was never saved with a group stays private.
 */
const loadAllNames = unstable_cache(
    async (): Promise<Record<CityLang, Record<string, string>>> => {
        const all = await prisma.city.findMany({ select: { slug: true, nameLv: true, nameEn: true, status: true } });
        const pendingSlugs = all.filter((row) => row.status === 'PENDING_REVIEW').map((row) => row.slug);
        // A pending city counts as used when a group or an event has it.
        const [groupCities, eventCities] = pendingSlugs.length
            ? await Promise.all([
                prisma.group.findMany({ where: { city: { in: pendingSlugs } }, distinct: ['city'], select: { city: true } }),
                prisma.event.findMany({ where: { city: { in: pendingSlugs } }, distinct: ['city'], select: { city: true } }),
            ])
            : [[], []];
        const used = new Set<string | null>([...groupCities, ...eventCities].map((row) => row.city));
        const rows = all.filter((row) => row.status === 'ACTIVE' || used.has(row.slug));
        const map: Record<CityLang, Record<string, string>> = { lv: {}, en: {} };
        for (const row of rows) {
            map.lv[row.slug] = row.nameLv;
            map.en[row.slug] = row.nameEn;
        }
        return map;
    },
    ['city-names'],
    { tags: [CITIES_TAG], revalidate: 60 }
);

const loadActive = unstable_cache(
    async (): Promise<{ slug: string; nameLv: string; nameEn: string }[]> =>
        prisma.city.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, nameLv: true, nameEn: true } }),
    ['city-active'],
    { tags: [CITIES_TAG], revalidate: 60 }
);

async function groupsUsing(slug: string): Promise<CityGroup[]> {
    const groups = await prisma.group.findMany({
        where: { city: slug },
        select: {
            id: true,
            name: true,
            slug: true,
            category: { include: TaxonomyResolver.getInclude('lv') },
            members: { where: { role: 'OWNER' }, select: { userId: true } },
        },
    });
    return groups.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        l1Slug: TaxonomyResolver.resolve(g.category).l1Slug,
        ownerIds: g.members.map((m) => m.userId),
    }));
}

async function nameTakenByOther(names: { nameLv: string; nameEn: string }, exceptId?: string): Promise<boolean> {
    const found = await prisma.city.findFirst({
        where: { ...(exceptId ? { id: { not: exceptId } } : {}), OR: [sameNameWhere(names.nameLv), sameNameWhere(names.nameEn)] },
        select: { id: true },
    });
    return found !== null;
}

export const CityService = {
    /** Names of approved cities and of pending ones a group uses (so that group's city reads right), by language. */
    async getNames(locale: string): Promise<Record<string, string>> {
        try {
            return (await loadAllNames())[lang(locale)];
        } catch (error) {
            console.error('[CityService.getNames] unavailable:', error);
            return {};
        }
    },

    /** Approved cities for pickers and filters, sorted by name in the language. */
    async listActive(locale: string): Promise<CityOption[]> {
        const l = lang(locale);
        try {
            const rows = await loadActive();
            return rows
                .map((row) => ({ slug: row.slug, name: l === 'en' ? row.nameEn : row.nameLv }))
                .sort((a, b) => a.name.localeCompare(b.name, l));
        } catch (error) {
            console.error('[CityService.listActive] unavailable:', error);
            return [];
        }
    },

    /** For the admin: everything, pending first. */
    async listAll(): Promise<CityRow[]> {
        const [rows, counts] = await Promise.all([
            prisma.city.findMany({
                include: { submittedBy: { select: { username: true, name: true } } },
                orderBy: [{ status: 'desc' }, { nameLv: 'asc' }],
            }),
            prisma.group.groupBy({ by: ['city'], _count: { _all: true } }),
        ]);
        const countBySlug = new Map(counts.map((c) => [c.city, c._count._all]));
        return rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            nameLv: row.nameLv,
            nameEn: row.nameEn,
            status: row.status,
            submittedAt: row.submittedAt,
            submittedBy: row.submittedBy,
            groupCount: countBySlug.get(row.slug) ?? 0,
        }));
    },


    /**
     * A person suggests a city that is not in the list. An existing city with the same name (approved or still pending,
     * case-insensitive, diacritics matter) is reused. `created` is true only for a new pending suggestion.
     */
    async suggest(params: { name: string; userId: string }): Promise<{ slug: string; name: string; status: 'ACTIVE' | 'PENDING_REVIEW'; created: boolean }> {
        const name = params.name;
        const reuse = (city: { slug: string; nameLv: string; nameEn: string; status: 'ACTIVE' | 'PENDING_REVIEW' }) => ({
            slug: city.slug,
            name: city.nameLv.toLowerCase() === name.toLowerCase() ? city.nameLv : city.nameEn,
            status: city.status,
            created: false,
        });

        const existing = await prisma.city.findFirst({ where: sameNameWhere(name), orderBy: [{ status: 'asc' }, { createdAt: 'asc' }] });
        if (existing) return reuse(existing);

        const base = citySlugBase(name);
        for (let attempt = 0; attempt < 20; attempt++) {
            const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
            try {
                const city = await prisma.city.create({
                    data: { slug, nameLv: name, nameEn: name, status: 'PENDING_REVIEW', submittedById: params.userId, submittedAt: new Date() },
                });
                return { slug: city.slug, name, status: city.status, created: true };
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
                // The slug is taken. If it was the same suggestion made at the same moment, reuse it; otherwise try the next slug.
                const raced = await prisma.city.findFirst({ where: sameNameWhere(name) });
                if (raced) return reuse(raced);
            }
        }
        throw new ActionError('CREATE_FAILED');
    },

    /**
     * A group may use a city that is approved, one this person suggested and is still pending,
     * or the city it already has (so saving other settings never fails).
     */
    async isUsableBy(slug: string, userId: string, currentCity?: string): Promise<boolean> {
        if (!slug) return false;
        if (currentCity !== undefined && slug === currentCity) return true;
        const city = await prisma.city.findUnique({ where: { slug }, select: { status: true, submittedById: true } });
        if (!city) return false;
        return city.status === 'ACTIVE' || city.submittedById === userId;
    },

    /**
     * An event may be placed in an approved city, or in one it (or its group) already has, even if that
     * one is still waiting for approval. The event form does not suggest new cities.
     */
    async isUsableForEvent(slug: string, keep: Array<string | null | undefined>): Promise<boolean> {
        if (!slug) return false;
        if (keep.some((k) => !!k && k === slug)) return true;
        const city = await prisma.city.findUnique({ where: { slug }, select: { status: true } });
        return city?.status === 'ACTIVE';
    },

    async createActive(names: { nameLv: string; nameEn: string }): Promise<void> {
        if (await nameTakenByOther(names)) throw new ActionError('CITY_EXISTS');
        const base = citySlugBase(names.nameEn);
        for (let attempt = 0; attempt < 20; attempt++) {
            try {
                await prisma.city.create({ data: { slug: attempt === 0 ? base : `${base}-${attempt + 1}`, nameLv: names.nameLv, nameEn: names.nameEn } });
                return;
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
            }
        }
        throw new ActionError('CREATE_FAILED');
    },

    /** Renames a city (either state). The stored `slug` never changes, so groups keep pointing at it. */
    async updateNames(id: string, names: { nameLv: string; nameEn: string }): Promise<void> {
        if (await nameTakenByOther(names, id)) throw new ActionError('CITY_EXISTS');
        const { count } = await prisma.city.updateMany({ where: { id }, data: names });
        if (count === 0) throw new ActionError('NOT_FOUND');
    },

    /** Approves a pending suggestion (names may be corrected). Returns who suggested it and the groups using it. */
    async approve(id: string, names: { nameLv: string; nameEn: string }): Promise<{ slug: string; submittedById: string | null; nameLv: string; nameEn: string; groups: CityGroup[] }> {
        if (await nameTakenByOther(names, id)) throw new ActionError('CITY_EXISTS');
        const { count } = await prisma.city.updateMany({ where: { id, status: 'PENDING_REVIEW' }, data: { ...names, status: 'ACTIVE' } });
        if (count === 0) throw new ActionError('NOT_FOUND');
        const row = await prisma.city.findUniqueOrThrow({ where: { id }, select: { slug: true, submittedById: true, nameLv: true, nameEn: true } });
        return { slug: row.slug, submittedById: row.submittedById, nameLv: row.nameLv, nameEn: row.nameEn, groups: await groupsUsing(row.slug) };
    },

    /**
     * Rejects a pending suggestion: the city is deleted and every group that used it is left without a city
     * (its owner is asked to choose one). Returns who to tell.
     */
    async reject(id: string): Promise<{ nameLv: string; nameEn: string; submittedById: string | null; groups: CityGroup[] }> {
        const city = await prisma.city.findFirst({ where: { id, status: 'PENDING_REVIEW' }, select: { slug: true, nameLv: true, nameEn: true, submittedById: true } });
        if (!city) throw new ActionError('NOT_FOUND');
        const groups = await groupsUsing(city.slug);
        await prisma.$transaction([
            prisma.group.updateMany({ where: { city: city.slug }, data: { city: '' } }),
            // Events follow their group: '' like Group.city, never NULL (R5a's NOT NULL step relies on it).
            prisma.event.updateMany({ where: { city: city.slug }, data: { city: '' } }),
            prisma.city.deleteMany({ where: { id, status: 'PENDING_REVIEW' } }),
        ]);
        return { nameLv: city.nameLv, nameEn: city.nameEn, submittedById: city.submittedById, groups };
    },

    /** An approved city nobody uses can be removed. */
    async deleteUnused(id: string): Promise<void> {
        const city = await prisma.city.findFirst({ where: { id, status: 'ACTIVE' }, select: { slug: true } });
        if (!city) throw new ActionError('NOT_FOUND');
        const [groups, events] = await Promise.all([
            prisma.group.count({ where: { city: city.slug } }),
            prisma.event.count({ where: { city: city.slug } }),
        ]);
        if (groups + events > 0) throw new ActionError('CITY_IN_USE');
        await prisma.city.deleteMany({ where: { id, status: 'ACTIVE' } });
    },
};
