'use client';

import { useEffect, useId, useState, useTransition, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { setAttendance, requestToJoin, cancelAttendance } from '@/actions/event-actions';
import { joinStepOf } from '@/lib/event-join';
import { useAuthGate } from '@/lib/useAuthGate';
import { UI } from '@/lib/constants';
import type { EventJoinView } from '@/lib/services/event-panel';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import GoingButton from './GoingButton';

const CHIP = 'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold';
const UNDO = 'text-sm font-semibold text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground disabled:opacity-60';
type Action = 'go' | 'request' | 'waitlist';

/**
 * The step of an event (AR-56), the same on the event page and in the panel: the note, then one line with the step's button (or the status
 * after pressing, with its quiet undo), then `trailing` (the panel's "Visa informācija"). Every press runs in a transition and is disabled while
 * it runs; the actions revalidate, so the result shows in place. The sign-in resume lives here: it clears the stored action even when the
 * step is no longer a button.
 */
export default function JoinStep({ join, trailing }: { join: EventJoinView; trailing?: ReactNode }) {
    const t = useTranslations('event');
    const tCommon = useTranslations('common.tag');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const noteId = useId();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { isAuthenticated, pendingAction, pendingUrl, clearPendingAction } = useAuthGate();
    const step = joinStepOf(join);

    const run = (call: () => Promise<{ success: boolean; error?: string }>) => {
        if (pending) return;
        setError(null);
        startTransition(async () => {
            const result = await call();
            if (!result.success) setError(result.error ?? 'ACTION_FAILED');
        });
    };
    const press = (action: Action) => run(() => (action === 'go' ? setAttendance(join.eventId, 'GOING', locale) : requestToJoin(join.eventId, action === 'waitlist', locale)));
    const undo = () => { setConfirmOpen(false); run(() => cancelAttendance(join.eventId, locale)); };

    // After signing in the page reloads on the event's own address: the remembered step continues once.
    const action = step.kind === 'act' ? step.action : null;
    useEffect(() => {
        if (!isAuthenticated || pendingAction !== 'event_join' || pendingUrl !== window.location.pathname) return;
        clearPendingAction();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-time continuation after the sign-in reload
        if (action) press(action);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per sign-in
    }, [isAuthenticated, pendingAction, pendingUrl]);

    const note = step.kind === 'act' || step.kind === 'done' ? step.note : null;
    const undoLabel = step.kind === 'done' ? t(step.undo === 'cancelGoing' ? 'join.undoGoing' : step.undo) : '';

    return (
        <div data-ui={UI.joinStep} className="grid gap-2">
            {note && <p id={noteId} className="text-[13px] text-foreground-muted">{t(note)}</p>}
            {(step.kind !== 'none' || trailing) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {step.kind === 'act' && <GoingButton action={step.action} pending={pending} onPress={() => press(step.action)} describedBy={note ? noteId : undefined} />}
                    {step.kind === 'done' && (
                        <>
                            <span className={clsx(CHIP, step.label === 'going' || step.label === 'approved' ? 'bg-tint text-foreground' : 'text-foreground-muted ring-[1.5px] ring-inset ring-border')}>
                                {(step.label === 'going' || step.label === 'approved') && <Check aria-hidden className="size-4" />}
                                {step.label === 'going' ? tCommon('going') : step.label === 'pending' ? tCommon('pending') : t(step.label === 'approved' ? 'approved' : 'onWaitlist')}
                            </span>
                            {step.confirm ? (
                                <ConfirmPopover
                                    isOpen={confirmOpen}
                                    onOpenChange={setConfirmOpen}
                                    message={t(step.undo === 'leaveEvent' ? 'join.confirmLeave' : 'join.confirmLeaveWaitlist')}
                                    confirmLabel={undoLabel}
                                    destructive
                                    isPending={pending}
                                    onConfirm={undo}
                                    renderTrigger={(props) => <button type="button" {...props} disabled={pending} className={UNDO}>{undoLabel}</button>}
                                />
                            ) : (
                                <button type="button" disabled={pending} onClick={undo} className={UNDO}>{undoLabel}</button>
                            )}
                        </>
                    )}
                    {step.kind === 'quiet' && <p className="text-sm font-semibold text-foreground-muted">{t(step.note)}</p>}
                    {trailing}
                </div>
            )}
            {error && <p role="alert" className="text-sm text-danger">{tErrors.has(error) ? tErrors(error as 'ACTION_FAILED') : tErrors('ACTION_FAILED')}</p>}
        </div>
    );
}
