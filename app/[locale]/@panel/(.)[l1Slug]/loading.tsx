import { getTranslations } from 'next-intl/server';
import { LoadingRegion, SkeletonBlock } from '@/components/ui/Skeleton';
import { PANEL_TITLE_ID } from '@/lib/constants';

/** The panel while its content loads: a picture block, then title, facts and text lines. */
export default async function PanelLoading() {
    const t = await getTranslations('common');
    return (
        <LoadingRegion label={t('loading')}>
            <SkeletonBlock className="h-24 rounded-none md:h-[120px]" />
            <div className="grid gap-2.5 px-[18px] pb-[18px] pt-3.5">
                <h2 id={PANEL_TITLE_ID} tabIndex={-1} className="sr-only outline-none">{t('loading')}</h2>
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonBlock className="h-3.5 w-1/2" />
                <SkeletonBlock className="h-3.5 w-2/3" />
                <SkeletonBlock className="h-3.5 w-full" />
                <SkeletonBlock className="h-3.5 w-5/6" />
                <SkeletonBlock className="h-10 w-full rounded-full" />
            </div>
        </LoadingRegion>
    );
}
