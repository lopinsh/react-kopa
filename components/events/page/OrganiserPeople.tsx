'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { decideAttendance, letInFromWaitlist } from '@/actions/event-actions';
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
    if (people.length === 0) {
        return <p id={id} className="text-[13px] text-foreground-muted">{kind === 'pending' ? t('noRequests') : kind === 'waitlist' ? t('noWaitlist') : t('noOneYet')}</p>;
    }
    return (
        <ul id={id} className="divide-y divide-border">
            {people.map((p, i) => {
                const name = p.name || p.username || '?';
                return (
                    <li key={p.userId} className="flex items-center justify-between gap-3 py-2">
                        <span className="min-w-0 truncate text-sm font-medium text-foreground">
                            {kind === 'waitlist' && <span className="mr-1 tabular-nums text-foreground-muted">{i + 1}.</span>}
                            {p.username ? <Link href={`/profile/${p.username}`} className="hover:underline">{name}</Link> : name}
                        </span>
                        {kind === 'pending' && (
                            <span className="flex shrink-0 items-center gap-1.5">
                                <Button size="sm" disabled={busy} onClick={() => run(() => decideAttendance(eventId, p.userId, 'approve', locale))}>{t('approve')}</Button>
                                <Button size="sm" variant="quiet" disabled={busy} onClick={() => run(() => decideAttendance(eventId, p.userId, 'decline', locale))}>{t('decline')}</Button>
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
