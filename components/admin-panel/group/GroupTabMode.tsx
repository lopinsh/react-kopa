'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { setAdminMode } from '@/actions/admin-panel-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { ADMIN_MODES, type AdminMode } from '@/lib/constants';

/** The group-mode switch (A-2): look at any group as its owner, a member or a visitor. Simulated; off = the admin's real standing. */
export default function GroupTabMode({ mode }: { mode: AdminMode | null }) {
    const t = useTranslations('admin.panel.group');
    const router = useRouter();
    const { error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const choose = (next: AdminMode | null) => {
        if (isPending || next === mode) return;
        startTransition(async () => {
            const res = await setAdminMode(next);
            if (!res.success) { toastError(t('modeFailed')); return; }
            router.refresh();
        });
    };

    const options: ReadonlyArray<{ value: AdminMode | null; label: string }> = [
        { value: null, label: t('modeOff') },
        ...ADMIN_MODES.map((m) => ({ value: m, label: t(`mode${m === 'owner' ? 'Owner' : m === 'member' ? 'Member' : 'Visitor'}`) })),
    ];

    return (
        <section className="flex flex-col gap-2 px-4 py-3">
            <p className="text-button-sm text-foreground">{t('modeTitle')}</p>
            <div role="group" aria-label={t('modeTitle')} className="flex flex-wrap gap-1">
                {options.map((o) => (
                    <button key={o.value ?? 'off'} type="button" disabled={isPending} aria-pressed={o.value === mode} onClick={() => choose(o.value)} className={buttonClass(o.value === mode ? 'primary' : 'quiet', undefined, 'sm')}>
                        {o.label}
                    </button>
                ))}
            </div>
            <p className="text-meta text-foreground-muted">{t('modeNote')}</p>
        </section>
    );
}
