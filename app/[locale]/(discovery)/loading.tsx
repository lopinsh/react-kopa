import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock, SkeletonCard } from '@/components/ui/Skeleton';

/** Discovery while its page loads: the sidebar's width, the filter bar's height, then the card grid of the page. */
export default async function DiscoveryLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <div className="flex min-h-full">
                <div aria-hidden="true" className="h-[calc(100dvh-64px)] w-12 shrink-0 border-r border-border bg-surface md:w-[280px]" />
                <div className="min-w-0 flex-1 pb-20 pt-4">
                    <div className="mx-auto w-full max-w-6xl px-4">
                        <SkeletonBlock className="h-12 w-full" />
                        <SkeletonBlock className="mb-4 mt-6 h-7 w-48" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </div>
                </div>
            </div>
        </LoadingRegion>
    );
}
