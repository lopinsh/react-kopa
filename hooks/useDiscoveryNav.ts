'use client';

import { useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { discoveryHref, parseDiscoveryParams, type DiscoveryParams } from '@/lib/discovery-params';

/** The current discovery choice (from the URL) and `go(change)` to change it; `replace` keeps Back clean for ticks. */
export function useDiscoveryNav() {
    const router = useRouter();
    const params = parseDiscoveryParams(useSearchParams());
    const [pending, startTransition] = useTransition();

    const go = useCallback((change: Partial<DiscoveryParams>, options?: { replace?: boolean }) => {
        const href = discoveryHref(params, change);
        startTransition(() => {
            if (options?.replace) router.replace(href, { scroll: false });
            else router.push(href, { scroll: false });
        });
    }, [params, router]);

    return { params, go, pending };
}
