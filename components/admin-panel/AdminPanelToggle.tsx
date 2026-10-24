'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { PanelRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { setAdminPanel } from '@/actions/admin-panel-actions';
import { useAdminPanelTab } from '@/components/providers/AdminPanelContext';
import { useToast } from '@/hooks/use-toast';
import { readLastTab } from './panel-storage';

type Props = {
    className?: string;
    /** Called right after the click, e.g. to close the menu the toggle sits in. */
    onToggle?: () => void;
};

/** Opens the admin tool panel on the last tab used, or closes it. Render it for site admins only. */
export default function AdminPanelToggle({ className, onToggle }: Props) {
    const tNav = useTranslations('nav');
    const tErrors = useTranslations('errors');
    const active = useAdminPanelTab() !== null;
    const router = useRouter();
    const { error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (isPending) return;
        onToggle?.();
        startTransition(async () => {
            const res = await setAdminPanel(active ? null : readLastTab());
            if (res.success) router.refresh();
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={active}
            onClick={handleClick}
            disabled={isPending}
            className={clsx('disabled:opacity-60', className)}
        >
            <PanelRight aria-hidden className="size-4 text-foreground-muted" />
            <span className="flex-1 text-left">{tNav('toolPanel')}</span>
            <span className="text-meta text-foreground-muted">{active ? tNav('modeOn') : tNav('modeOff')}</span>
        </button>
    );
}
