import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock } from '@/components/ui/Skeleton';

/** Discovery while its page loads: the drawer column from `lg`, the filter line, then cards from `md` and rows on phones. */
export default async function DiscoveryLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <div className="flex min-h-full">
                <div aria-hidden="true" className="hidden h-[calc(100dvh-4rem)] w-[232px] shrink-0 border-r border-border bg-surface lg:block" />
                <div className="min-w-0 flex-1 pb-20 pt-3 md:pt-4">
                    <div className="mx-auto w-full max-w-browse px-gutter">
                        <div className="mb-3 grid gap-2 md:mb-4 md:flex md:items-center md:justify-between">
                            <SkeletonBlock className="h-8 w-full rounded-pill md:order-2 md:w-48" />
                            <div className="flex gap-1.5"><SkeletonBlock className="h-8 w-20 rounded-pill" /><SkeletonBlock className="h-8 w-24 rounded-pill" /></div>
                        </div>
                        <div className="hidden gap-3 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
                            {Array.from({ length: 6 }, (_, i) => <SkeletonBlock key={i} className="h-32 rounded-2xl" />)}
                        </div>
                        <div className="grid gap-2 md:hidden">
                            {Array.from({ length: 6 }, (_, i) => <SkeletonBlock key={i} className="h-14 rounded-xl" />)}
                        </div>
                    </div>
                </div>
            </div>
        </LoadingRegion>
    );
}
