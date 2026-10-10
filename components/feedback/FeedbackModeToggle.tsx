'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, MessageSquareText } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { setFeedbackMode } from '@/actions/feedback-actions';
import { useFeedbackMode } from '@/components/providers/FeedbackModeContext';
import { useToast } from '@/hooks/use-toast';

type Props = {
    className?: string;
    /** Bare "turn off" text, for the floating bar. */
    compact?: boolean;
    /** Called right after the click, e.g. to close the menu the toggle sits in. */
    onToggle?: () => void;
};

/** Switches feedback mode on or off for the signed-in site admin. Render it for site admins only. */
export default function FeedbackModeToggle({ className, compact, onToggle }: Props) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const active = useFeedbackMode();
    const router = useRouter();
    const { error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (isPending) return;
        onToggle?.();
        startTransition(async () => {
            const res = await setFeedbackMode(!active);
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
            {compact ? (
                <span>{t('turnOff')}</span>
            ) : (
                <>
                    <MessageSquareText className="h-4 w-4 text-foreground-muted" />
                    <span className="flex-1 text-left">{t('label')}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                </>
            )}
        </button>
    );
}
