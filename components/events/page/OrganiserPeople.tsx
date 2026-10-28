'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { decideAttendance, letInFromWaitlist, removeAttendee } from '@/actions/event-actions';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import Button from '@/components/ui/Button';
import type { Person } from '@/lib/services/event-page';

export type PeopleKind = 'going' | 'pending' | 'waitlist';
export type RunAction = (call: () => Promise<{ success: boolean; error?: string }>) => void;

/** One list of the Rīkotājiem box: requests (approve / decline), the waiting list in join order (let in), or the people going (names only). */
export default function OrganiserPeople({ id, kind, people, eventId, locale, busy, run }: {
    id: string;
    kind: PeopleKind;
    people: Person[];
    eventId: string;
    locale: string;
    busy: boolean;
    run: RunAction;
}) {
    const t = useTranslations('event');
    const router = useRouter();
    const [removing, setRemoving] = useState<string | null>(null);
    if (people.length === 0) {
        return <p id={id} className="text-meta text-foreground-muted">{kind === 'pending' ? t('noRequests') : kind === 'waitlist' ? t('noWaitlist') : t('noOneYet')}</p>;
    }
    return (
        <ul id={id} className="divide-y divide-border">
            {people.map((p, i) => {
                const name = p.name || p.username || '?';
                return (
                    <li key={p.userId} className="flex items-center justify-between gap-3 py-2">
                        <span className="min-w-0 truncate text-body-sm text-foreground">
                            {kind === 'waitlist' && <span className="mr-1 tabular-nums text-foreground-muted">{i + 1}.</span>}
                            {p.username ? <Link href={`/profile/${p.username}`} className="hover:underline">{name}</Link> : name}
                        </span>
                        {kind === 'pending' && (
                            <span className="flex shrink-0 items-center gap-1.5">
                                <Button size="sm" disabled={busy} onClick={() => run(() => decideAttendance(eventId, p.userId, 'approve', locale))}>{t('approve')}</Button>
                                <Button size="sm" variant="quiet" disabled={busy} onClick={() => run(() => decideAttendance(eventId, p.userId, 'decline', locale))}>{t('decline')}</Button>
                            </span>
                        )}
                        {kind === 'going' && !p.team && (
                            <span className="flex shrink-0 items-center gap-1.5">
                                <Button size="sm" variant="quiet" disabled={busy} onClick={() => run(async () => {
                                    const res = await getOrCreateDirectChat(p.userId);
                                    if (res.success && res.data) router.push(`/messages?c=${res.data.conversationId}`);
                                    return res;
                                })}>{t('writeTo')}</Button>
                                <ConfirmPopover
                                    isOpen={removing === p.userId}
                                    onOpenChange={(open) => setRemoving(open ? p.userId : null)}
                                    message={t('removeGuestConfirm', { name })}
                                    confirmLabel={t('removeGuest')}
                                    destructive
                                    isPending={busy}
                                    onConfirm={() => { setRemoving(null); run(() => removeAttendee(eventId, p.userId, locale)); }}
                                    renderTrigger={(props) => <Button size="sm" variant="quiet" className="text-danger" disabled={busy} {...props}>{t('removeGuest')}</Button>}
                                />
                            </span>
                        )}
                        {kind === 'waitlist' && (
                            <Button size="sm" disabled={busy} onClick={() => run(() => letInFromWaitlist(eventId, p.userId, locale))}>{t('letIn')}</Button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
