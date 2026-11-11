import { useId, useState, useTransition } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { approveTag } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import type { ActiveL2WithAliases } from '@/lib/services/taxonomy.service';
import type { CategoryImage } from '@/lib/banner';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import TextCounter from '@/components/ui/TextCounter';
import { CATEGORY_NAME_MAX } from '@/lib/constants';
import { Input } from '@/components/ui/Input';

type Props = {
    topic: ActiveL2WithAliases;
    heading: string;
    /** Read-only: photos change through the content file, not here. */
    image?: CategoryImage | null;
};

/** Names and slugs of a Veids (L2) or sub-veids (L3): one form for both levels. */
export default function SlideoverTopicForm({ topic, heading, image }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tFields = useTranslations('admin.taxonomy.fields');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const uid = useId();

    const initialEn = topic.translations.find(x => x.lang === 'en')?.title || '';
    const initialLv = topic.translations.find(x => x.lang === 'lv')?.title || '';
    const [nameEn, setNameEn] = useState(initialEn);
    const [nameLv, setNameLv] = useState(initialLv);
    const [slugEn, setSlugEn] = useState(topic.slug);
    const [slugLv, setSlugLv] = useState(topic.slugLv || topic.slug);

    const handleSave = () => {
        startTransition(async () => {
            const res = await approveTag(topic.id, { nameEn: nameEn.trim(), nameLv: nameLv.trim(), slugEn: slugEn.trim(), slugLv: slugLv.trim() });
            if (res.success) {
                success(t('save') + ' - ' + c('success'));
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    const dirty = nameEn !== initialEn || nameLv !== initialLv || slugEn !== topic.slug || slugLv !== (topic.slugLv || topic.slug);

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-item">{heading}</h3>
                {dirty && <span className="bg-warning/10 text-warning text-meta px-2 py-0.5 rounded-pill">{t('unsavedChanges')}</span>}
            </div>

            <div className="grid gap-4 bg-surface-elevated/30 p-4 line rounded-xl">
                {image && (
                    <div className="min-w-0">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-elevated">
                            <Image src={image.url} alt="" fill sizes="(min-width: 512px) 448px, 100vw" className="object-cover" />
                        </div>
                        <BannerCredit credit={image.credit} className="mt-1" />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                        <label className="block text-tag text-foreground-muted mb-1">{tFields('nameEn')}</label>
                        <Input type="text" aria-describedby={`${uid}-en`} value={nameEn} onChange={e => setNameEn(e.target.value)} />
                        <TextCounter id={`${uid}-en`} length={nameEn.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-tag text-foreground-muted mb-1">{tFields('nameLv')}</label>
                        <Input type="text" aria-describedby={`${uid}-lv`} value={nameLv} onChange={e => setNameLv(e.target.value)} />
                        <TextCounter id={`${uid}-lv`} length={nameLv.length} max={CATEGORY_NAME_MAX} className="mt-1 text-right" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div className="min-w-0">
                        <label className="block text-tag text-foreground-muted mb-1">{tFields('slugEn')}</label>
                        <Input type="text" value={slugEn} onChange={e => setSlugEn(e.target.value)} />
                    </div>
                    <div className="min-w-0">
                        <label className="block text-tag text-foreground-muted mb-1">{tFields('slugLv')}</label>
                        <Input type="text" value={slugLv} onChange={e => setSlugLv(e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-4 py-2 text-button-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {t('save')}
                    </button>
                </div>
            </div>
        </section>
    );
}
