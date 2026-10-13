import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock, SkeletonRow } from '@/components/ui/Skeleton';

/** A group's page while it loads: the frame (banner, pages column) stays, this fills the page column: a phone title, a tab line and three rows. */
export default async function GroupPageLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <SkeletonBlock className="h-7 w-40 md:hidden" />
            <SkeletonBlock className="mt-3 h-8 w-64 md:mt-0" />
            <div className="mt-3">
                {Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />)}
            </div>
        </LoadingRegion>
    );
}
