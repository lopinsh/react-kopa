'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { deleteEvent, setEventFull } from '@/actions/event-actions';
import Button, { buttonClass } from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { UI } from '@/lib/constants';
import type { EventPageData } from '@/lib/services/event-page';
import OrganiserPeople, { type PeopleKind, type RunAction } from './OrganiserPeople';

type Props = {
    event: Pick<EventPageData, 'id' | 'joinMode' | 'isFull' | 'timing'>;
    lists: NonNullable<EventPageData['organiser']>;
    locale: string;
    /** `/l1/group/slug`, without the locale. */
    groupPath: string;
    eventPath: string;
};

/**
 * "Rīkotājiem" (AR-59), the team's box at the bottom of the event page: the counts as buttons that open their list, "Labot", "Slēgt pieteikšanos"
 * and "Dzēst". Every action runs in a transition with all buttons disabled meanwhile; the page refreshes after it. A finished event keeps only "Dzēst".
 */
export default function EventOrganiserBox({ event, lists, locale, groupPath, eventPath }: Props) {
    const t = useTranslations('event');
    const tOrg = useTranslations('event.organiser');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const listId = useId();
    const root = useRef<HTMLDivElement>(null);
    const acted = useRef(false);
    const [busy, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const isRequest = event.joinMode === 'REQUEST';
    const past = event.timing === 'past';
    const [open, setOpen] = useState<PeopleKind | null>(isRequest && lists.pending.length > 0 ? 'pending' : null);

    // After approving, declining or letting someone in, their row is gone: focus the list's next button, else the count that opened it.
    const sizes = `${lists.pending.length}/${lists.waitlist.length}/${lists.going.length}`;
    useEffect(() => {
        if (!acted.current) return;
        acted.current = false;
        const active = document.activeElement;
        if (active && active !== document.body && active.isConnected) return;
        (root.current?.querySelector<HTMLElement>(`[id="${listId}"] button`) ?? root.current?.querySelector<HTMLElement>('[aria-expanded="true"]'))?.focus();
    }, [sizes, listId]);

    const run: RunAction = (call) => {
        if (busy) return;
        setError(null);
        acted.current = true;
        startTransition(async () => {
            const result = await call();
            if (!result.success) setError(result.error ?? 'ACTION_FAILED');
            router.refresh();
        });
    };
    const remove = () => {
        if (busy) return;
        setError(null);
        startTransition(async () => {
            const result = await deleteEvent(event.id, locale);
            setConfirmOpen(false);
            if (!result.success) { setError(result.error); return; }
            // The move to the list, a beat later: the action's own refresh re-renders this (now deleted) address and Next then
            // reloads it, which swallowed an immediate move (the old Dzēst ended on a 404).
            setTimeout(() => router.push(`${groupPath}/events`), 400);
        });
    };

    const counts: Array<{ kind: PeopleKind; label: string; count: number }> = [
        { kind: 'going', label: isRequest ? tOrg('approved') : tOrg('going'), count: lists.going.length },
        ...(isRequest ? [{ kind: 'pending' as const, label: tOrg('requests'), count: lists.pending.length }] : []),
        ...(isRequest && (event.isFull || lists.waitlist.length > 0) ? [{ kind: 'waitlist' as const, label: tOrg('waitlist'), count: lists.waitlist.length }] : []),
    ];

    return (
        <div ref={root} data-ui={UI.eventOrganiser} className="mt-3.5 grid gap-2.5 rounded-2xl bg-background p-4">
            <h2 className="text-[13px] font-semibold text-foreground">{tOrg('title')}</h2>
            {!past && (
                <>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-foreground-muted">
                        {counts.map((c) => (
                            <button
                                key={c.kind}
                                type="button"
                                aria-expanded={open === c.kind}
                                aria-controls={open === c.kind ? listId : undefined}
                                onClick={() => setOpen(open === c.kind ? null : c.kind)}
                                className="rounded-md py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                {c.label} <strong className="font-semibold text-foreground">{c.count}</strong>
                            </button>
                        ))}
                    </p>
                    {open && <OrganiserPeople id={listId} kind={open} people={lists[open]} eventId={event.id} locale={locale} busy={busy} run={run} />}
                </>
            )}
            <div className="flex flex-wrap items-center gap-2">
                {!past && <Link href={`${eventPath}/edit`} className={buttonClass('quiet', undefined, 'sm')}>{t('editEvent')}</Link>}
                {!past && isRequest && (
                    <Button size="sm" variant="quiet" disabled={busy} onClick={() => run(() => setEventFull(event.id, !event.isFull, locale))}>
                        {event.isFull ? t('reopenSignups') : t('closeSignups')}
                    </Button>
                )}
                <Button size="sm" variant="quiet" className="text-danger" disabled={busy} onClick={() => setConfirmOpen(true)}>{t('deleteEvent')}</Button>
            </div>
            {!past && isRequest && !event.isFull && <p className="text-[13px] text-foreground-muted">{t('closeSignupsHint')}</p>}
            {error && <p role="alert" className="text-sm text-danger">{tErrors.has(error) ? tErrors(error as 'ACTION_FAILED') : tErrors('ACTION_FAILED')}</p>}
            <ConfirmDialog isOpen={confirmOpen} title={t('deleteEvent')} message={t('deleteConfirm')} confirmLabel={t('deleteEvent')} destructive isPending={busy} onConfirm={remove} onCancel={() => setConfirmOpen(false)} />
        </div>
    );
}
