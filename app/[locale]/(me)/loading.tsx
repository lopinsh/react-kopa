import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock, SkeletonRow } from '@/components/ui/Skeleton';

/** An own-area page while it loads: the person header and the menu stay, this fills the page column. */
export default async function MeLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <div>
                <SkeletonBlock className="mb-4 h-7 w-56" />
                {Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)}
            </div>
        </LoadingRegion>
    );
}
