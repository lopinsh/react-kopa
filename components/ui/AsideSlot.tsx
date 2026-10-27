'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { usePathname } from '@/i18n/routing';

/**
 * The side column of a framed area (AR-47, AR-60): who or what this space is about, never actions that belong to the page.
 * From 1024 px it is the third column, sticky (`offsetOnInfo`: lowered by the tabs row); below that it follows the page in flow (`lgOnly`: not at all). It is not rendered on the pages named
 * in `hideSegments` (a group's focus pages) or whose exact path is in `hidePaths`, so those keep the full width.
 */
export default function AsideSlot({ children, label, hideSegments, hidePaths, lgOnly, offsetOnInfo }: { children: ReactNode; label: string; hideSegments?: string[]; hidePaths?: string[]; lgOnly?: boolean; /** On the page with sections (segment null): start level with the first section's text, under the tabs row. */ offsetOnInfo?: boolean }) {
    const segment = useSelectedLayoutSegment();
    const pathname = usePathname();
    const offset = offsetOnInfo && segment === null;
    if (hidePaths?.includes(pathname)) return null;
    if (segment && hideSegments?.includes(segment)) return null;
    return (
        <aside data-aside aria-label={label} className={`${lgOnly ? 'hidden lg:grid' : 'grid'} ${offset ? 'lg:mt-[calc(var(--part-tabs-h)+1.5rem)]' : 'lg:mt-0'} mt-6 min-w-0 max-w-page content-start gap-4 lg:col-start-3 lg:row-start-1 lg:w-aside lg:max-w-none lg:sticky lg:top-5 lg:self-start`}>
            {children}
        </aside>
    );
}
