import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock, SkeletonRow } from '@/components/ui/Skeleton';

/** A group's page while it loads: the group frame (banner, tabs) stays, this fills the page column. */
export default async function GroupPageLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
                <SkeletonBlock className="mb-4 h-7 w-56" />
                {Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)}
            </div>
        </LoadingRegion>
    );
}
