import type { ReactNode } from 'react';

/**
 * The body of a framed area (layout B): the pages menu down the left from 768 px, the page beside it.
 * Shared by a group's frame and your own area, so both start at the same spacing right under the bars (AR-47, AR-60).
 * `nav` renders itself hidden on phones (they use a ☰ drawer); a page never adds its own top margin or container.
 */
export default function FrameColumns({ nav, children, className }: { nav: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={`mx-auto max-w-6xl px-3 pb-6 pt-3 md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-[22px] md:px-[22px] md:pt-[18px]${className ? ` ${className}` : ''}`}>
            {nav}
            <div className="grid min-w-0 content-start gap-3">{children}</div>
        </div>
    );
}
