'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { decideAttendance, letInFromWaitlist, setEventFull } from '@/actions/event-actions';
import type { EventJoinModeValue } from '@/lib/constants';

type Person = { userId: string; name: string | null; username: string | null };

type Props = {
    eventId: string;
    joinMode: EventJoinModeValue;
    isFull: boolean;
    locale: string;
    going: Person[];
    pending: Person[];
    /** In join order. */
    waitlist: Person[];
};

const SMALL_BUTTON = 'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-60';

export default function EventOrganiserPanel({ eventId, joinMode, isFull, locale, going, pending, waitlist }: Props) {
    const t = useTranslations('event');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function run(action: () => Promise<{ success: boolean; error?: string }>) {
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (!result.success) setError(result.error ?? 'ACTION_FAILED');
            router.refresh();
        });
    }

    const isRequest = joinMode === 'REQUEST';
    const displayName = (p: Person) => p.name || p.username || '?';

    const row = (p: Person, actions: React.ReactNode) => (
        <li key={p.userId} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-sm font-medium text-foreground">{displayName(p)}</span>
            <span className="flex shrink-0 items-center gap-1.5">{actions}</span>
        </li>
    );

    const section = (title: string, count: number, empty: string, items: React.ReactNode[]) => (
        <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                {title} · {count}
            </h4>
            {items.length > 0 ? (
                <ul className="divide-y divide-border">{items}</ul>
            ) : (
                <p className="py-1 text-xs text-foreground-muted">{empty}</p>
            )}
        </div>
    );

    return (
        <div className="space-y-5 rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t('organiserTitle')}</h3>
                {isPending && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
            </div>

            {isRequest && (
                <div className="space-y-1.5">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => setEventFull(eventId, !isFull, locale))}
                        className={clsx(
                            'w-full rounded-2xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-60',
                            isFull
                                ? 'bg-[var(--accent)] text-white hover:opacity-90'
                                : 'border border-border bg-background text-foreground hover:bg-surface-elevated'
                        )}
                    >
                        {isFull ? t('reopenSignups') : t('closeSignups')}
                    </button>
                    <p className="text-center text-xs text-foreground-muted">{t('closeSignupsHint')}</p>
                </div>
            )}

            {isRequest && section(
                t('requestsTitle'),
                pending.length,
                t('noRequests'),
                pending.map((p) => row(p, (
                    <>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => run(() => decideAttendance(eventId, p.userId, 'approve', locale))}
                            className={clsx(SMALL_BUTTON, 'bg-[var(--accent)] text-white hover:opacity-90')}
                        >
                            <Check className="h-3.5 w-3.5" />
                            {t('approve')}
                        </button>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => run(() => decideAttendance(eventId, p.userId, 'decline', locale))}
                            className={clsx(SMALL_BUTTON, 'border border-border text-foreground-muted hover:text-foreground')}
                        >
                            <X className="h-3.5 w-3.5" />
                            {t('decline')}
                        </button>
                    </>
                )))
            )}

            {isRequest && (isFull || waitlist.length > 0) && section(
                t('waitlistTitle'),
                waitlist.length,
                t('noWaitlist'),
                waitlist.map((p, i) => row({ ...p, name: `${i + 1}. ${displayName(p)}` }, (
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => letInFromWaitlist(eventId, p.userId, locale))}
                        className={clsx(SMALL_BUTTON, 'bg-[var(--accent)] text-white hover:opacity-90')}
                    >
                        <Check className="h-3.5 w-3.5" />
                        {t('letIn')}
                    </button>
                )))
            )}

            {section(
                isRequest ? t('approvedTitle') : t('goingTitle'),
                going.length,
                t('noOneYet'),
                going.map((p) => row(p, null))
            )}

            {error && (
                <p role="alert" className="text-sm text-red-500">
                    {tErrors(error as 'ACTION_FAILED')}
                </p>
            )}
        </div>
    );
}
