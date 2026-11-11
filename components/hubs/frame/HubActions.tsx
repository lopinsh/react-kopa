'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Share2, XCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { closeHubCity } from '@/actions/hub-city-actions';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useHubContext } from '@/components/providers/HubProvider';
import { createGroupHref } from '@/lib/hub-path';
import { useShareLink } from '@/hooks/useShareLink';
import { buttonClass, iconButtonClass } from '@/components/ui/Button';

/**
 * The two actions of the head tile (K1-08, K-85): Izveidot grupu opens the wizard with this Tēma and Veids ticked (signed out, the wizard page sends to sign-in and back);
 * Dalīties shares the address of the hub, its word shows from `md`.
 */
export default function HubActions() {
    const t = useTranslations('hub.actions');
    const hub = useHubContext();
    const tErrors = useTranslations('errors');
    const share = useShareLink();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [confirming, setConfirming] = useState(false);
    const [isPending, setPending] = useState(false);

    const close = async () => {
        if (isPending || !hub.local) return;
        setPending(true);
        const result = await closeHubCity(hub.local.hubCityId);
        if (!result.success) {
            setPending(false);
            toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            return;
        }
        success(t('closed'));
        router.push(hub.topicHref);
    };

    return (
        <div className="flex items-center gap-1">
            <Link href={createGroupHref(hub.l1Slug, hub.slug, hub.local?.citySlug)} className={buttonClass('onTone', 'px-4')}>
                <Plus aria-hidden className="size-4" />
                {t('createGroup')}
            </Link>
            <button type="button" onClick={() => share({ title: hub.name, url: window.location.href })} aria-label={t('share')} className={iconButtonClass('onToneGhost', 'md', 'md:w-auto md:gap-1.5 md:px-3 md:text-button-sm')}>
                <Share2 aria-hidden className="size-4" />
                <span className="max-md:sr-only">{t('share')}</span>
            </button>
            {hub.local && hub.isAdmin && (
                <>
                    <button type="button" onClick={() => setConfirming(true)} className={iconButtonClass('onToneGhost', 'md', 'md:w-auto md:gap-1.5 md:px-3 md:text-button-sm')}>
                        <XCircle aria-hidden className="size-4" />
                        <span className="max-md:sr-only">{t('close')}</span>
                    </button>
                    <ConfirmDialog isOpen={confirming} destructive isPending={isPending} title={t('close')} message={t('closeConfirm', { name: hub.name })} confirmLabel={t('close')} onConfirm={close} onCancel={() => setConfirming(false)} />
                </>
            )}
        </div>
    );
}
