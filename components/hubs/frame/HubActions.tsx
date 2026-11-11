'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Share2, XCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { closeHubCity } from '@/actions/hub-city-actions';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useHubContext } from '@/components/providers/HubProvider';
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
    const [isPending, startTransition] = useTransition();

    const close = () => {
        if (isPending || !hub.local) return;
        const hubCityId = hub.local.hubCityId;
        startTransition(async () => {
            const result = await closeHubCity(hubCityId);
            if (!result.success) {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                return;
            }
            setConfirming(false);
            success(t('closed'));
            router.push(hub.topicHref);
        });
    };

    return (
        <div className="flex items-center gap-1">
            <Link href={`/create?category=${hub.l1Slug}&tag=${hub.slug}`} className={buttonClass('onTone', 'px-4')}>
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
