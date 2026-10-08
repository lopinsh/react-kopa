'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { setAttendance } from '@/actions/event-actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
    eventId: string;
    initialStatus: 'GOING' | 'NONE';
    locale: string;
    /** Set for logged-out visitors: shows a sign-in link instead of the buttons. */
    signInHref?: string;
};

export default function RSVPButtons({ eventId, initialStatus, locale, signInHref }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const t = useTranslations('event');
    const tErrors = useTranslations('errors');
    const [error, setError] = useState<string | null>(null);

    const handleToggle = () => {
        const finalStatus = status === 'GOING' ? 'NONE' : 'GOING';

        setError(null);
        startTransition(async () => {
            const result = await setAttendance(eventId, finalStatus, locale);
            if (result.success) {
                setStatus(finalStatus);
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    };

    if (signInHref) {
        return (
            <Link
                href={signInHref}
                className="flex items-center justify-center rounded-2xl bg-[color:var(--accent)] py-4 font-black uppercase text-white shadow-lg transition-all active:scale-95"
            >
                {t('signInToRsvp')}
            </Link>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={clsx(
                    "flex items-center justify-center gap-2 rounded-2xl py-4 font-black uppercase transition-all shadow-lg active:scale-95 group relative overflow-hidden",
                    status === 'GOING'
                        ? "bg-[color:var(--accent)] text-white"
                        : "bg-surface-elevated text-foreground hover:bg-white/5 border border-white/5"
                )}
            >
                {isPending && status === 'GOING' && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}
                <CheckCircle2 className={clsx("h-5 w-5", status === 'GOING' ? "text-white" : "text-foreground-muted group-hover:text-foreground")} />
                {t('going')}
            </button>

            {error && (
                <p role="alert" className="text-sm text-red-500">
                    {tErrors(error as 'ACTION_FAILED')}
                </p>
            )}
        </div>
    );
}
