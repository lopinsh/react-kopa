'use client';

import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { useDraftActions } from '@/components/admin/design/useDraftActions';

/** Footer line while a design draft is saved: the preview bar is hidden with the panel open, so Publicēt and Atmest live here. */
export default function PanelDraftNote() {
    const t = useTranslations('admin.panel');
    const tBar = useTranslations('admin.design.bar');
    const { isPending, publish, discard } = useDraftActions();

    return (
        <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-body-sm">
            <Eye aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate weight-strong text-foreground">{t('draftActive')}</span>
            <button type="button" disabled={isPending} onClick={publish} className={buttonClass('primary', '', 'sm')}>{tBar('publish')}</button>
            <button type="button" disabled={isPending} onClick={discard} className={buttonClass('quiet', '', 'sm')}>{tBar('discard')}</button>
        </div>
    );
}
