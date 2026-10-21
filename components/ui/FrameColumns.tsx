import type { ReactNode } from 'react';

/**
 * The body of a framed area (layout B): the pages menu down the left from 768 px, the page beside it, and from 1024 px an optional side column (`aside`, an `AsideSlot`).
 * Shared by a group's frame and your own area, so both start at the same spacing right under the bars (AR-47, AR-60).
 * `nav` renders itself hidden on phones (they use a ☰ drawer); a page never adds its own top margin or container.
 * The third column exists only while an aside is on the page (`data-aside`), so a page without one keeps the full width.
 */
export default function FrameColumns({ nav, aside, children, className }: { nav: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={`mx-auto max-w-browse px-gutter pb-6 pt-3 md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-6 md:pt-5 lg:has-[>[data-aside]]:grid-cols-[190px_minmax(0,1fr)_var(--spacing-aside)]${className ? ` ${className}` : ''}`}>
            {nav}
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">{children}</div>
            {aside}
        </div>
    );
}
