'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';

/** The list's current choice (from the page's own URL params, so it holds while a panel's address is in the bar) and `go(change)` to change it; `replace` keeps Back clean for ticks. */
export function useDiscoveryNav() {
    const router = useRouter();
    const { params } = useDiscovery();
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
