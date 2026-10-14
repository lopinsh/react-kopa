'use client';

import { useRef, type ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';

const SWIPE_PX = 48;

/** A sideways move of 48 px or more on the strip goes to the previous or next week (phones). Vertical scrolling is left alone. */
export default function SwipeWeek({ prev, next, children }: { prev: string | null; next: string; children: ReactNode }) {
    const router = useRouter();
    const start = useRef<{ x: number; y: number } | null>(null);
    return (
        <div
            className="touch-pan-y"
            onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; }}
            onPointerUp={(e) => {
                const from = start.current;
                start.current = null;
                if (!from) return;
                const dx = e.clientX - from.x;
                if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(e.clientY - from.y) * 1.5) return;
                const href = dx < 0 ? next : prev;
                if (href) router.push(href, { scroll: false });
            }}
        >
            {children}
        </div>
    );
}
