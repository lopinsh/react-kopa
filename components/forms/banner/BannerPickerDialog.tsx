'use client';

import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import PictureFallback from '@/components/ui/PictureFallback';
import PhotoTile from '@/components/forms/banner/PhotoTile';
import UnsplashSearch from '@/components/forms/banner/UnsplashSearch';
import { getCurated, type UnsplashPick } from '@/lib/banner';

type Props = {
    kind: 'group' | 'event';
    l1Slug: string | null;
    searchEnabled: boolean;
    selectedUrl: string | null;
    onPick: (photo: UnsplashPick | null) => void;
    onClose: () => void;
};

/** "Izvēlies attēlu": no image, then the category's curated photos, then Unsplash search. A sheet on phones. */
export default function BannerPickerDialog({ kind, l1Slug, searchEnabled, selectedUrl, onPick, onClose }: Props) {
    const t = useTranslations('banner');
    const curated = l1Slug ? getCurated(l1Slug) : [];
    return (
        <Modal onClose={onClose} title={t('dialogTitle')} size="2xl" panelClassName="flex flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <PhotoTile label={kind === 'event' ? t('noneEvent') : t('none')} sub={t('noneHint')} selected={!selectedUrl} onPick={() => onPick(null)}>
                        {l1Slug && <PictureFallback l1Slug={l1Slug} />}
                    </PhotoTile>
                    {curated.map((p) => (
                        <PhotoTile key={p.id} thumb={p.thumb} alt={p.alt} label={p.credit.name} selected={selectedUrl === p.url} onPick={() => onPick(p)} />
                    ))}
                </div>
                {searchEnabled && (
                    <section className="space-y-3 border-t border-border pt-4">
                        <h3 className="text-label text-foreground">{t('searchHeading')}</h3>
                        <UnsplashSearch selectedUrl={selectedUrl} onPick={onPick} />
                    </section>
                )}
            </div>
        </Modal>
    );
}
