'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, ShieldCheck, ShieldOff, Crown, MessageSquare } from 'lucide-react';
import { makeAdmin, removeAdmin, searchTeamCandidates } from '@/actions/team-actions';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import { teamSearchSchema } from '@/lib/validations/team';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { useToast } from '@/hooks/use-toast';
import type { TeamCandidate, TeamMember } from '@/lib/services/team.service';

type Pending = { kind: 'make' | 'remove'; person: TeamCandidate };

const BUTTON = 'flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated disabled:opacity-50';

function Person({ person }: { person: TeamCandidate }) {
    return (
        <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{person.name || person.username || person.email}</p>
            <p className="truncate text-xs text-foreground-muted">
                {[person.username ? `@${person.username}` : null, person.email].filter(Boolean).join(' · ')}
            </p>
        </div>
    );
}

/** Admin list with Remove admin, plus a user search with Make admin. Each change asks first. */
export default function TeamManager({ team, canManage, viewerId }: { team: TeamMember[]; canManage: boolean; viewerId: string }) {
    const t = useTranslations('admin.team');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TeamCandidate[] | null>(null);
    const [confirming, setConfirming] = useState<Pending | null>(null);
    const [isPending, startTransition] = useTransition();

    const showError = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !teamSearchSchema.safeParse({ query }).success) return;
        startTransition(async () => {
            const res = await searchTeamCandidates(query);
            if (res.success) setResults(res.data ?? []);
            else showError(res.error);
        });
    };

    const handleMessage = (personId: string) => {
        if (isPending) return;
        startTransition(async () => {
            const res = await getOrCreateDirectChat(personId);
            if (res.success && res.data) router.push(`/messages?c=${res.data.conversationId}`);
            else if (!res.success) showError(res.error);
        });
    };

    const handleConfirm = () => {
        if (isPending || !confirming) return;
        const { kind, person } = confirming;
        startTransition(async () => {
            const res = kind === 'make' ? await makeAdmin(person.id, locale) : await removeAdmin(person.id, locale);
            setConfirming(null);
            if (res.success) {
                toastSuccess(t(kind === 'make' ? 'madeAdmin' : 'removedAdmin'));
                if (kind === 'make') setResults(null);
                router.refresh();
            } else {
                showError(res.error);
            }
        });
    };

    const nameOf = (person: TeamCandidate) => person.name || person.username || person.email || '';

    // Make or remove an admin is undoable: a small confirmation at the row's button (OD-06).
    const renderConfirm = (kind: Pending['kind'], person: TeamCandidate) => (
        <ConfirmPopover
            isOpen={confirming?.kind === kind && confirming.person.id === person.id}
            onOpenChange={(open) => setConfirming(open ? { kind, person } : null)}
            message={t(kind === 'make' ? 'makeMessage' : 'removeMessage', { name: nameOf(person) })}
            confirmLabel={t(kind === 'make' ? 'makeAdmin' : 'removeAdmin')}
            destructive={kind === 'remove'}
            isPending={isPending}
            onConfirm={handleConfirm}
            renderTrigger={(trigger) => (
                <button {...trigger} type="button" disabled={isPending} className={`${BUTTON} ${kind === 'remove' ? 'text-danger' : 'text-foreground'}`}>
                    {kind === 'remove' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    {t(kind === 'make' ? 'makeAdmin' : 'removeAdmin')}
                </button>
            )}
        />
    );

    return (
        <div className="space-y-10">
            <section aria-labelledby="team-admins">
                <h2 id="team-admins" className="mb-3 text-lg font-bold text-foreground">{t('adminsTitle')}</h2>
                <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
                    {team.map((member) => (
                        <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                            <Person person={member} />
                            <div className="flex shrink-0 items-center gap-2">
                                {member.role === 'OWNER' && (
                                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                        <Crown className="h-3.5 w-3.5" />
                                        {t('ownerBadge')}
                                    </span>
                                )}
                                {member.id !== viewerId && (
                                    <button type="button" disabled={isPending} onClick={() => handleMessage(member.id)} className={`${BUTTON} text-foreground`}>
                                        <MessageSquare className="h-4 w-4" />
                                        {t('message')}
                                    </button>
                                )}
                                {canManage && member.role !== 'OWNER' && renderConfirm('remove', member)}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {canManage && (
            <section aria-labelledby="team-add">
                <h2 id="team-add" className="mb-3 text-lg font-bold text-foreground">{t('addTitle')}</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        aria-label={t('searchPlaceholder')}
                        maxLength={80}
                        className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
                    />
                    <button type="submit" disabled={isPending} className={BUTTON}>
                        <Search className="h-4 w-4" />
                        {t('search')}
                    </button>
                </form>
                <p className="mt-2 text-xs text-foreground-muted">{t('searchHint')}</p>
                {results && (
                    results.length === 0 ? (
                        <p className="mt-4 text-sm text-foreground-muted">{t('noResults')}</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
                            {results.map((person) => (
                                <li key={person.id} className="flex items-center justify-between gap-3 p-4">
                                    <Person person={person} />
                                    {renderConfirm('make', person)}
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </section>
            )}
        </div>
    );
}
