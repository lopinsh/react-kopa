'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useLocale } from 'next-intl';

/**
 * "Atvērt grupas lapu" and "Visa informācija": the full page, loaded in place of the panel's history entry (like opening a shared link),
 * so Back from that page returns to the list. Modified clicks open as usual.
 */
export default function FullPageLink({ path, className, children }: { path: string; className: string; children: ReactNode }) {
    const locale = useLocale();
    const href = `/${locale}${path}`;
    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        window.location.replace(href);
    };
    return <a href={href} onClick={onClick} className={className}>{children}</a>;
}
