'use client';

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { setAttendance, requestToJoin, cancelAttendance } from '@/actions/event-actions';
import { joinStepOf } from '@/lib/event-join';
import { useAuthGate } from '@/lib/useAuthGate';
import { UI } from '@/lib/constants';
import type { EventJoinView } from '@/lib/services/event-panel';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import GoingButton from './GoingButton';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

const CHIP = 'inline-flex h-10 items-center gap-1.5 rounded-pill px-4 text-button-sm';
const UNDO = 'text-body-sm text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground disabled:opacity-60';
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
    const { gateAction, isModalOpen, closeModal, isAuthenticated, pendingAction, pendingUrl, clearPendingAction } = useAuthGate();
    const root = useRef<HTMLDivElement>(null);
    const acted = useRef(false);
    const step = joinStepOf(join);
    const stepKey = step.kind === 'act' ? step.action : step.kind === 'done' ? step.label : step.kind;

    // The pressed button is gone once the step changes: keep focus in the step (its new button), not on the page body.
    useEffect(() => {
        if (!acted.current) return;
        acted.current = false;
        const active = document.activeElement;
        if (active && active !== document.body && active.isConnected) return;
        root.current?.querySelector<HTMLElement>('button, a')?.focus();
    }, [stepKey]);

    const run = (call: () => Promise<{ success: boolean; error?: string }>) => {
        if (pending) return;
        setError(null);
        acted.current = true;
        startTransition(async () => {
            const result = await call();
            if (!result.success) setError(result.error ?? 'ACTION_FAILED');
        });
    };
    const press = (action: Action) => run(() => (action === 'go' ? setAttendance(join.eventId, 'GOING', locale) : requestToJoin(join.eventId, action === 'waitlist', locale)));
    const undo = () => { setConfirmOpen(false); run(() => cancelAttendance(join.eventId, locale)); };

    // After signing in the page reloads on the event's own address: the remembered step continues once, on that new page. While the sign-in
    // pop-up is still open the session already counts as signed in, but the reload is about to cut the step's request off.
    const action = step.kind === 'act' ? step.action : null;
    useEffect(() => {
        if (isModalOpen || !isAuthenticated || pendingAction !== 'event_join' || pendingUrl !== window.location.pathname) return;
        clearPendingAction();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-time continuation after the sign-in reload
        if (action) press(action);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per sign-in
    }, [isModalOpen, isAuthenticated, pendingAction, pendingUrl]);

    const note = step.kind === 'act' || step.kind === 'done' ? step.note : null;
    const undoLabel = step.kind === 'done' ? t(step.undo === 'cancelGoing' ? 'join.undoGoing' : step.undo) : '';

    return (
        <div ref={root} data-ui={UI.joinStep} className="grid gap-2">
            {note && <p id={noteId} className="text-meta text-foreground-muted">{t(note)}</p>}
            {(step.kind !== 'none' || trailing) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {step.kind === 'act' && <GoingButton action={step.action} pending={pending} onPress={() => gateAction(() => press(step.action), 'event_join')} describedBy={note ? noteId : undefined} />}
                    {step.kind === 'done' && (
                        <>
                            <span className={clsx(CHIP, step.label === 'going' || step.label === 'approved' ? 'bg-tint text-foreground' : 'text-foreground-muted')}>
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
                    {step.kind === 'quiet' && <p className="text-body-sm text-foreground-muted">{t(step.note)}</p>}
                    {trailing}
                </div>
            )}
            {isModalOpen && <AuthGateModal isOpen onClose={closeModal} reason="join" />}
            {error && <p role="alert" className="text-body-sm text-danger">{tErrors.has(error) ? tErrors(error as 'ACTION_FAILED') : tErrors('ACTION_FAILED')}</p>}
        </div>
    );
}
