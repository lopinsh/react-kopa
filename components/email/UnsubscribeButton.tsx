'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button, { buttonClass } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { unsubscribeByLink } from '@/actions/email-actions';

/** The one button of the unsubscribe page (R33); opening the page alone changes nothing. */
export default function UnsubscribeButton({ u, s }: { u: string; s: string }) {
    const t = useTranslations('email.unsubscribe');
    const tErrors = useTranslations('errors');
    const { error: toastError } = useToast();
    const [done, setDone] = useState(false);
    const [isPending, startTransition] = useTransition();
    const busy = useRef(false);

    const submit = () => {
        if (isPending || busy.current) return;
        busy.current = true;
        startTransition(async () => {
            const result = await unsubscribeByLink({ u, s }).catch(() => ({ success: false as const, error: 'ACTION_FAILED' }));
            if (result.success) setDone(true);
            else toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            busy.current = false;
        });
    };

    if (done) {
        return (
            <div className="grid justify-items-start gap-4" role="status">
                <p className="text-body">{t('done')}</p>
                <Link href="/settings" className={buttonClass('secondary')}>{t('settingsLink')}</Link>
            </div>
        );
    }
    return <Button onClick={submit} disabled={isPending} className="justify-self-start">{t('confirm')}</Button>;
}
