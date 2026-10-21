'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { usePathname } from '@/i18n/routing';

/**
 * The side column of a framed area (AR-47, AR-60): who or what this space is about, never actions that belong to the page.
 * From 1024 px it is the third column, sticky; below that it follows the page in flow. It is not rendered on the pages named
 * in `hideSegments` (a group's focus pages) or outside `showPaths` (path prefixes of the own area), so those keep the full width.
 */
export default function AsideSlot({ children, label, hideSegments, showPaths }: { children: ReactNode; label: string; hideSegments?: string[]; showPaths?: string[] }) {
    const segment = useSelectedLayoutSegment();
    const pathname = usePathname();
    if (segment && hideSegments?.includes(segment)) return null;
    if (showPaths && !showPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
    return (
        <aside data-aside aria-label={label} className="mt-6 grid min-w-0 content-start gap-4 md:col-start-2 md:mt-0 lg:col-start-3 lg:row-start-1 lg:w-aside lg:sticky lg:top-5 lg:self-start">
            {children}
        </aside>
    );
}
