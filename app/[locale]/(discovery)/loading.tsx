import { cookies } from 'next/headers';
import { clsx } from 'clsx';
import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock } from '@/components/ui/Skeleton';
import { DISCOVERY_RAIL_COOKIE } from '@/lib/constants';

/** Discovery while its page loads, on the page's grid: the column at the viewer's fold width (from `lg`), the title row (40), the chip row (64), then cards from `md` and rows on phones. */
export default async function DiscoveryLoading() {
    const [t, tDiscovery, cookieStore] = await Promise.all([getTranslations('common'), getTranslations('discovery'), cookies()]);
    const folded = cookieStore.get(DISCOVERY_RAIL_COOKIE)?.value === '1';
    return (
        <LoadingRegion label={t('loading')}>
            <div className="flex min-h-full">
                <div aria-hidden="true" className={clsx('hidden h-[calc(100dvh-var(--spacing-header))] shrink-0 border-r border-border bg-surface lg:block', folded ? 'w-14' : 'w-board-col pl-board-pad pr-[var(--list-pad)]')}>
                    {!folded && (
                        <>
                            <div className="mt-4 flex h-10 items-center pl-2"><SkeletonBlock className="h-4 w-16 rounded-pill" /></div>
                            <div className="mb-4 mt-3 flex h-9 items-center"><SkeletonBlock className="h-8 w-full rounded-item" /></div>
                            <div className="grid gap-1">{Array.from({ length: 6 }, (_, i) => <SkeletonBlock key={i} className="h-9 rounded-item" />)}</div>
                        </>
                    )}
                </div>
                <div className="min-w-0 flex-1 px-gutter pb-20 pt-4">
                    <div className="flex h-10 items-baseline gap-4 whitespace-nowrap text-title text-foreground-muted" aria-hidden="true">
                        <span>{tDiscovery('groups')} <SkeletonBlock className="inline-block h-2.5 w-[18px] align-baseline" /></span>
                        <span>{tDiscovery('events')} <SkeletonBlock className="inline-block h-2.5 w-[18px] align-baseline" /></span>
                    </div>
                    <div className="mb-4 mt-3 flex h-9 items-center gap-1.5">
                        {Array.from({ length: 4 }, (_, i) => <SkeletonBlock key={i} className={clsx('h-7 w-20 rounded-pill', i === 3 && 'lg:hidden')} />)}
                    </div>
                    <div className="hidden gap-5 md:grid md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
                        {Array.from({ length: 6 }, (_, i) => <SkeletonBlock key={i} className="h-32 rounded-2xl" />)}
                    </div>
                    <div className="grid gap-2 md:hidden">
                        {Array.from({ length: 6 }, (_, i) => <SkeletonBlock key={i} className="h-14 rounded-xl" />)}
                    </div>
                </div>
            </div>
        </LoadingRegion>
    );
}
