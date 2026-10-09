'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Clock, Loader2, ListPlus, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { setAttendance, requestToJoin, cancelAttendance } from '@/actions/event-actions';
import type { EventJoinModeValue } from '@/lib/constants';
import type { AttendanceStatus } from '@prisma/client';

const AuthGateModal = dynamic(() => import('../modals/AuthGateModal'), { ssr: false });

type Props = {
    eventId: string;
    joinMode: EventJoinModeValue;
    isFull: boolean;
    myStatus: AttendanceStatus | null;
    locale: string;
    /** Set for logged-out visitors: shows a button that opens the sign-in pop-up instead of the buttons. */
    requireSignIn?: boolean;
    /** Compact rows (Events tab) hide the explanatory notes. */
    compact?: boolean;
};

const PRIMARY_BASE = 'flex w-full items-center justify-center gap-2 bg-[color:var(--accent)] font-black uppercase tracking-wide text-white transition-all active:scale-95 disabled:opacity-60';
const NEUTRAL_BASE = 'flex w-full items-center justify-center gap-2 border border-border bg-surface-elevated font-black uppercase tracking-wide text-foreground-muted';
const DONE_BASE = 'flex w-full cursor-default items-center justify-center gap-2 border-2 border-[color:var(--accent)] bg-transparent font-black uppercase tracking-wide text-[color:var(--accent)]';
const LINK_BUTTON = 'text-xs font-semibold text-foreground-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-60';

export default function EventParticipation({ eventId, joinMode, isFull, myStatus, locale, requireSignIn, compact = false }: Props) {
    const t = useTranslations('event');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [signInOpen, setSignInOpen] = useState(false);
    const size = compact ? 'rounded-xl px-3 py-2 text-xs' : 'rounded-2xl px-4 py-3.5 text-sm shadow-lg';
    const PRIMARY = clsx(PRIMARY_BASE, size);
    const NEUTRAL = clsx(NEUTRAL_BASE, size);
    const DONE = clsx(DONE_BASE, compact ? 'rounded-xl px-3 py-2 text-xs' : 'rounded-2xl px-4 py-3.5 text-sm');

    function run(action: () => Promise<{ success: boolean; error?: string }>) {
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (!result.success) setError(result.error ?? 'ACTION_FAILED');
            // Also refresh on errors: a stale page (e.g. the event just became Full) shows the right state afterwards.
            router.refresh();
        });
    }

    if (requireSignIn) {
        return (
            <>
                <button type="button" className={PRIMARY} onClick={() => setSignInOpen(true)}>
                    {t('signInToRsvp')}
                </button>
                {signInOpen && <AuthGateModal isOpen onClose={() => setSignInOpen(false)} />}
            </>
        );
    }

    const spinner = isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null;
    const cancel = (label: string) => (
        <button type="button" className={LINK_BUTTON} disabled={isPending} onClick={() => run(() => cancelAttendance(eventId, locale))}>
            {label}
        </button>
    );

    let main: React.ReactNode;
    let note: string | null = null;
    let secondary: React.ReactNode = null;

    if (joinMode === 'OPEN') {
        if (myStatus === 'GOING') {
            main = (
                <div className={DONE}>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('goingDone')}
                </div>
            );
            secondary = cancel(t('cancelGoing'));
        } else {
            main = (
                <button type="button" className={PRIMARY} disabled={isPending} onClick={() => run(() => setAttendance(eventId, 'GOING', locale))}>
                    {spinner ?? <CheckCircle2 className="h-4 w-4" />}
                    {t('going')}
                </button>
            );
            note = t('openNote');
        }
    } else if (myStatus === 'GOING') {
        main = (
            <div className={DONE}>
                <CheckCircle2 className="h-4 w-4" />
                {t('approved')}
            </div>
        );
        secondary = cancel(t('leaveEvent'));
    } else if (myStatus === 'PENDING') {
        main = (
            <div className={NEUTRAL}>
                <Send className="h-4 w-4" />
                {t('requestSent')}
            </div>
        );
        secondary = cancel(t('withdrawRequest'));
    } else if (myStatus === 'DECLINED') {
        main = <div className={NEUTRAL}>{t('declined')}</div>;
    } else if (myStatus === 'WAITLISTED' && isFull) {
        main = (
            <div className={NEUTRAL}>
                <Clock className="h-4 w-4" />
                {t('onWaitlist')}
            </div>
        );
        note = t('waitlistNote');
        secondary = cancel(t('leaveWaitlist'));
    } else if (isFull) {
        main = (
            <button type="button" className={PRIMARY} disabled={isPending} onClick={() => run(() => requestToJoin(eventId, true, locale))}>
                {spinner ?? <ListPlus className="h-4 w-4" />}
                {t('joinWaitlist')}
            </button>
        );
        note = t('fullNote');
    } else {
        // Not asked yet, or waitlisted before the organiser switched Full off (asks again).
        main = (
            <button type="button" className={PRIMARY} disabled={isPending} onClick={() => run(() => requestToJoin(eventId, false, locale))}>
                {spinner ?? <Send className="h-4 w-4" />}
                {t('requestToJoin')}
            </button>
        );
        note = t('requestNote');
    }

    return (
        <div className="flex flex-col items-stretch gap-2">
            {main}
            {!compact && note && <p className="text-center text-xs text-foreground-muted">{note}</p>}
            {secondary && <div className="text-center">{secondary}</div>}
            {error && (
                <p role="alert" className="text-sm text-red-500">
                    {tErrors(error as 'ACTION_FAILED')}
                </p>
            )}
        </div>
    );
}
