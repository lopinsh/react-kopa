'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { setAdminMode } from '@/actions/admin-panel-actions';
import { useRouter } from '@/i18n/routing';
import { UI, type AdminMode } from '@/lib/constants';

/** Shown on every group page while a site admin's simulated mode is on (A-2), with the way out. */
export default function AdminModeMarker({ mode }: { mode: AdminMode }) {
    const t = useTranslations('admin.panel.group');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const off = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await setAdminMode(null);
            if (res.success) router.refresh();
        });
    };
    const label = t(`mode${mode === 'owner' ? 'Owner' : mode === 'member' ? 'Member' : 'Visitor'}`);

    return (
        <div data-ui={UI.banner} data-admin-mode={mode} className="flex flex-wrap items-center justify-between gap-3 bg-foreground px-4 py-2 text-body-sm text-background">
            <span className="flex items-center gap-2"><Eye aria-hidden className="size-4 shrink-0" />{t('marker', { mode: label })}</span>
            <button type="button" onClick={off} disabled={isPending} className="underline disabled:opacity-50">{t('markerOff')}</button>
        </div>
    );
}
