import type { ReactNode } from 'react';

/**
 * The body of a framed area (layout B): the pages menu down the left, the page beside it, and from 1024 px an optional side column (`aside`, an `AsideSlot`).
 * Shared by a group's frame and your own area, so both start at the same spacing right under the bars (AR-47, AR-60).
 * `navFrom` is where the menu column starts: `md` (768 px, the own area, default) or `lg` (1024 px, a group, whose ☰ drawer serves 768-1023).
 * `nav` renders itself hidden below that; a page never adds its own top margin or container.
 * The third column exists only while an aside is on the page (`data-aside`), so a page without one keeps the full width.
 */
export default function FrameColumns({ nav, aside, children, className, navFrom = 'md' }: { nav: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; navFrom?: 'md' | 'lg' }) {
    const grid = navFrom === 'lg'
        ? 'lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-6'
        : 'md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-6';
    return (
        <div className={`mx-auto max-w-browse px-gutter pb-6 pt-3 md:pt-5 ${grid} lg:has-[>[data-aside]]:grid-cols-[190px_minmax(0,1fr)_var(--spacing-aside)]${className ? ` ${className}` : ''}`}>
            {nav}
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">{children}</div>
            {aside}
        </div>
    );
}
