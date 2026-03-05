'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import DiscoveryFilterBar from '@/components/discovery/DiscoveryFilterBar';

type Props = {
    taxonomy: TaxonomyTree;
    activeCat?: string;
    activeTags?: string[];
    initialQuery?: string;
    locale: string;
    currentView: 'grid' | 'list';
};

/**
 * Thin client wrapper so page.tsx (Server Component) can pass an
 * `onViewChange` function to DiscoveryFilterBar without becoming a
 * client component itself.
 */
export default function DiscoveryFilterBarWrapper(props: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const onViewChange = useCallback(
        (view: 'grid' | 'list') => {
            const next = new URLSearchParams(searchParams.toString());
            next.set('view', view);
            startTransition(() => router.push(pathname + '?' + next.toString()));
        },
        [router, pathname, searchParams]
    );

    return (
        <DiscoveryFilterBar
            {...props}
            onViewChange={onViewChange}
        />
    );
}
