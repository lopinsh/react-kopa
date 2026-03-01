'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Props = {
    hasMore: boolean;
    currentLimit: number;
    increment?: number;
};

export default function InfiniteScrollTrigger({ hasMore, currentLimit, increment = 12 }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const newParams = new URLSearchParams(searchParams.toString());
                    newParams.set('limit', (currentLimit + increment).toString());
                    router.push(`?${newParams.toString()}`, { scroll: false });
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, currentLimit, increment, router, searchParams]);

    if (!hasMore) return null;

    return (
        <div ref={observerTarget} className="py-12 flex justify-center w-full">
            <div className="flex items-center gap-3 text-foreground-muted animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium tracking-wide font-mono uppercase">Loading more groups...</span>
            </div>
        </div>
    );
}
