'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { afterOverlayClose } from '@/hooks/useBackClose';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';

/** The list's current choice (from the page's own URL params, so it holds while a panel's address is in the bar) and `go(change)` to change it; `replace` keeps Back clean for ticks. */
export function useDiscoveryNav() {
    const router = useRouter();
    const { params } = useDiscovery();
    const [pending, startTransition] = useTransition();

    const go = useCallback((change: Partial<DiscoveryParams>, options?: { replace?: boolean }) => {
        const href = discoveryHref(params, change);
        // From a sheet the choice waits for the sheet's own Back, which would otherwise swallow the push.
        afterOverlayClose(() => startTransition(() => {
            if (options?.replace) router.replace(href, { scroll: false });
            else router.push(href, { scroll: false });
        }));
    }, [params, router]);

    return { params, go, pending };
}
