import { ADMIN_NAV, type AdminBadge, type AdminNavItem, type AdminNavSection } from '@/lib/constants/adminNav';

export type AdminCounts = Record<AdminBadge, number>;
export type AdminLocation = { section: AdminNavSection | null; item: AdminNavItem | null; part: string | null };

/** The sections (and pages) this viewer may open; a section with no page left is dropped. */
export function visibleSections(isOwner: boolean): AdminNavSection[] {
    return ADMIN_NAV.map((s) => ({ ...s, items: s.items.filter((i) => isOwner || !i.ownerOnly) })).filter((s) => s.items.length > 0);
}

/**
 * Where a locale-less admin path sits. The group categorization page belongs to Struktūra with no page marked.
 * `part` is the open Design part (`?part=`, default the first) or the Handbook chapter ('ui-elements' for the demo page).
 */
export function resolveAdminLocation(pathname: string, partParam: string | null, sections: AdminNavSection[]): AdminLocation {
    const items = sections.flatMap((s) => s.items.map((item) => ({ s, item })));
    const hit = items.find(({ item }) => (item.match === 'exact' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)));
    if (!hit) {
        const structure = pathname.startsWith('/admin/groups/') ? sections.find((s) => s.id === 'structure') ?? null : null;
        return { section: structure, item: null, part: null };
    }
    let part: string | null = null;
    if (hit.item.id === 'design') part = hit.item.parts?.includes(partParam ?? '') ? partParam : hit.item.parts?.[0] ?? null;
    if (hit.item.id === 'handbook') part = pathname.split('/')[3] ?? null;
    return { section: hit.s, item: hit.item, part };
}

export function sectionBadge(section: AdminNavSection, counts: AdminCounts): number {
    return section.items.reduce((sum, i) => sum + (i.badge ? counts[i.badge] : 0), 0);
}
