'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Star, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toggleAttendance } from '@/actions/event-actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
    eventId: string;
    initialStatus: 'GOING' | 'INTERESTED' | 'NONE';
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

    const handleToggle = (newStatus: 'GOING' | 'INTERESTED') => {
        const finalStatus = status === newStatus ? 'NONE' : newStatus;

        setError(null);
        startTransition(async () => {
            const result = await toggleAttendance(eventId, finalStatus, locale);
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
                onClick={() => handleToggle('GOING')}
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

            <button
                onClick={() => handleToggle('INTERESTED')}
                disabled={isPending}
                className={clsx(
                    "flex items-center justify-center gap-2 rounded-2xl py-4 font-black uppercase transition-all group relative overflow-hidden",
                    status === 'INTERESTED'
                        ? "border-2 border-[color:var(--accent)] text-[color:var(--accent)]"
                        : "border-2 border-border text-foreground-muted hover:border-foreground-muted/50 hover:text-foreground"
                )}
            >
                {isPending && status === 'INTERESTED' && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}
                <Star className={clsx("h-5 w-5 fill-current", status === 'INTERESTED' ? "text-[var(--accent)]" : "text-transparent stroke-foreground-muted group-hover:stroke-foreground")} />
                {t('interested')}
            </button>
            {error && (
                <p role="alert" className="text-sm text-red-500">
                    {tErrors(error as 'ACTION_FAILED')}
                </p>
            )}
        </div>
    );
}
