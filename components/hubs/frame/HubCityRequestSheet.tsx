'use client';

import { useId, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { HUB_NOTE_MAX } from '@/lib/constants';
import { hubCityRequestSchema } from '@/lib/validations/hub-note';
import { requestHubCity } from '@/actions/hub-city-actions';
import { useHubContext } from '@/components/providers/HubProvider';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import TextCounter from '@/components/ui/TextCounter';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/**
 * "Pieprasīt {Veids} pilsētā {city}" (K3-11): the one line, an optional public note, Atcelt / Pieprasīt. The second person opens the hub and lands on it;
 * the first sees a toast. Signed out, the sign-in pop-up comes first and returns to `?request=<city>` on the topic hub.
 */
export default function HubCityRequestSheet({ segment, onClose }: { segment: string; onClose: () => void }) {
    const t = useTranslations('hub.request');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const hub = useHubContext();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const id = useId();
    const [isPending, startTransition] = useTransition();
    const [note, setNote] = useState('');
    const cityName = hub.kur.find((c) => c.segment === segment)?.name ?? segment;

    if (!hub.signedIn) return <AuthGateModal isOpen onClose={onClose} returnTo={`/${locale}${hub.topicHref}?request=${segment}`} />;

    const submit = () => {
        if (isPending) return;
        const parsed = hubCityRequestSchema.safeParse({ hubSlug: hub.slug, city: segment, note });
        if (!parsed.success) return;
        startTransition(async () => {
            const result = await requestHubCity(parsed.data);
            if (!result.success) {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                // The text stays when the note is what failed (limit); otherwise the sheet has nothing more to do.
                if (result.error !== 'HUB_NOTE_LIMIT') onClose();
                return;
            }
            onClose();
            if (result.data?.opened) {
                success(t('opened'));
                router.push(result.data.href);
            } else {
                success(t('sent'));
                router.refresh();
            }
        });
    };

    return (
        <Modal size="sm" title={t('title', { hub: hub.title, city: cityName })} locked={isPending} onClose={onClose}>
            <p className="text-body-sm text-foreground">{t('body')}</p>
            <Textarea id={`${id}-note`} rows={3} className="mt-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('note')} aria-label={t('note')} aria-describedby={`${id}-count`} />
            <TextCounter id={`${id}-count`} length={note.length} max={HUB_NOTE_MAX} className="mt-1" />
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={isPending}>{tCommon('cancel')}</Button>
                <Button size="sm" onClick={submit} disabled={isPending || note.length > HUB_NOTE_MAX}>{t('submit')}</Button>
            </div>
        </Modal>
    );
}
