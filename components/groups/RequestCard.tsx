'use client';

import { useTransition } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { Check, X, MessageSquare, History } from 'lucide-react';
import { manageMembership } from '@/actions/group-actions';
import { GROUP_MEMBERSHIP_CHANGED } from '@/lib/constants/events';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import { UI } from '@/lib/constants';

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: { name: string | null; image: string | null };
}

type Props = {
    groupId: string;
    membershipId: string;
    targetUser: {
        id: string;
        name: string | null;
        image: string | null;
        avatarSeed?: string | null;
    };
    chatId: string | null;
    messages: Message[];
    locale: string;
};

export default function RequestCard({ membershipId, targetUser, chatId, messages, locale }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const { success, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    // Messages arrive oldest first: the card shows the newest, with the time of that one.
    const latest = messages.length > 0 ? messages[messages.length - 1] : null;

    const handleAction = (action: 'APPROVE' | 'DECLINE') => {
        startTransition(async () => {
            const result = await manageMembership(membershipId, action, locale);
            if (result.success) {
                // The shell sidebar is outside the group layout, so tell it to reload its badge.
                window.dispatchEvent(new Event(GROUP_MEMBERSHIP_CHANGED));
                success(c_common('manageSuccess'));
            } else {
                toastError(t('ACTION_FAILED'));
            }
        });
    };

    return (
        <div data-ui={UI.requestCard} className="flex flex-col p-5 rounded-3xl bg-surface-elevated/50 border border-border group/card hover:border-[var(--accent)]/30 transition-all shadow-card">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface relative shadow-inner">
                        <img
                            src={avatarUrl(targetUser)}
                            alt={targetUser.name || ''}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="min-w-0">
                        <span className="font-bold text-base text-foreground tracking-tight block truncate">
                            {targetUser.name || t('anonymousUser')}
                        </span>
                        {latest && (
                            <span className="text-[10px] font-black uppercase text-foreground-muted tracking-widest flex items-center gap-1.5">
                                <History className="h-3 w-3" />
                                {format.relativeTime(new Date(latest.createdAt), now)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAction('APPROVE')}
                        disabled={isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white disabled:opacity-50 transition-all font-bold shadow-sm"
                        title={c_common('approve')}
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleAction('DECLINE')}
                        disabled={isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all font-bold shadow-sm"
                        title={c_common('decline')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Latest message in the applicant's group chat */}
            {chatId && (
                <div className="mt-4 border-t border-border/50 pt-4">
                    {latest && (
                        <div className="rounded-2xl border border-border/50 bg-surface p-4">
                            <p className="line-clamp-2 text-sm italic leading-relaxed text-foreground/80">
                                &quot;{latest.content}&quot;
                            </p>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                                {latest.senderId === targetUser.id ? targetUser.name || c_common('applicant') : latest.sender.name || c_common('role_admin')}
                                {' · '}
                                {format.relativeTime(new Date(latest.createdAt), now)}
                            </p>
                        </div>
                    )}
                    <Link
                        href={`/messages?c=${chatId}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground-muted transition-colors hover:text-[var(--accent)]"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t('openChat')}
                    </Link>
                </div>
            )}
        </div>
    );
}
