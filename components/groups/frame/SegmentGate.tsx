'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

/**
 * Shows server-rendered children by page of the group: `show="info"` only on Informācija, `show="other"` only elsewhere.
 * `infoClassName` is used on Informācija instead of the default `contents` (the wrapper adds no box and no grid gap).
 */
export default function SegmentGate({ show, infoClassName, children }: { show?: 'info' | 'other'; infoClassName?: string; children: ReactNode }) {
    const onInfo = useSelectedLayoutSegment() === null;
    if (show === 'info' && !onInfo) return null;
    if (show === 'other' && onInfo) return null;
    return <div className={onInfo && infoClassName ? infoClassName : 'contents'}>{children}</div>;
}
