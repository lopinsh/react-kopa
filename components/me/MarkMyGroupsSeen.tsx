'use client';

import { useEffect, useRef } from 'react';
import { markMyGroupsSeen } from '@/actions/user-actions';
import { OWN_COUNTS_CHANGED } from '@/lib/constants/events';

/**
 * Manas grupas has shown in the browser: its "new" count restarts. Done here, after mount, and never while rendering on the server
 * (a prefetch or a reload would count as a visit). The page keeps what it showed; the menus recount.
 */
export default function MarkMyGroupsSeen() {
    const sent = useRef(false);
    useEffect(() => {
        if (sent.current) return;
        sent.current = true;
        void markMyGroupsSeen().then((res) => {
            if (res.success) window.dispatchEvent(new Event(OWN_COUNTS_CHANGED));
        });
    }, []);
    return null;
}
