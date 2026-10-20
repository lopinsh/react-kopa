'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { resolveAdminLocation, visibleSections, type AdminCounts, type AdminLocation } from '@/lib/admin-nav';
import type { AdminNavSection } from '@/lib/constants/adminNav';

export type HandbookChapterEntry = { slug: string; title: string };

type Value = { counts: AdminCounts; chapters: HandbookChapterEntry[]; sections: AdminNavSection[]; location: AdminLocation; /** Design parts whose draft has contrast issues; set by the Dizains editor, shown as a dot in the pages list. */ flaggedParts: string[]; setFlaggedParts: (parts: string[]) => void };

const AdminFrameContext = createContext<Value | null>(null);

/** Context Law for the admin frame: the layout fetches counts and chapters; the parts read them here. */
export default function AdminFrameProvider({ counts, chapters, isOwner, children }: { counts: AdminCounts; chapters: HandbookChapterEntry[]; isOwner: boolean; children: ReactNode }) {
    const pathname = usePathname();
    const part = useSearchParams().get('part');
    const sections = useMemo(() => visibleSections(isOwner), [isOwner]);
    const [flaggedParts, setFlaggedParts] = useState<string[]>([]);
    const location = resolveAdminLocation(pathname, part, sections);
    return <AdminFrameContext.Provider value={{ counts, chapters, sections, location, flaggedParts, setFlaggedParts }}>{children}</AdminFrameContext.Provider>;
}

export function useAdminFrame(): Value {
    const v = useContext(AdminFrameContext);
    if (!v) throw new Error('useAdminFrame outside AdminFrameProvider');
    return v;
}
