'use client';

import { useEffect } from 'react';

/**
 * The safety net of `wantsFullPage`: the address is already the page's own, so load it as a page (in place of this history entry).
 * Links that know they want the page avoid this round trip with `PageLink` or `FullPageLink`.
 */
export default function FullPageInstead() {
    useEffect(() => {
        window.location.replace(window.location.href);
    }, []);
    return null;
}
