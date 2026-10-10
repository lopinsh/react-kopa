'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { avatarUrl } from '@/lib/avatar';
import type { InboxRow } from '@/lib/services/message.service';
import { useMessageTime } from './useMessageTime';

type Props = {
    conversations: InboxRow[];
    activeId: string | null;
    onOpen: (id: string) => void;
    titleOf: (conv: InboxRow) => string;
    className?: string;
};

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

/** The group's name in its category colour. The colour is resolved on the server (Taxonomy Law); here it only becomes a CSS variable. */
export function GroupLabel({ group, className }: { group: NonNullable<InboxRow['group']>; className?: string }) {
    const vars: CssVars = { '--group-color': group.accentColor };
    return (
        <span
            style={vars}
            className={clsx('flex items-center gap-1.5 truncate font-bold text-[color:color-mix(in_srgb,var(--group-color)_65%,var(--foreground))]', className)}
        >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--group-color)]" aria-hidden="true" />
            <span className="truncate">{group.name}</span>
        </span>
    );
}

export default function ConversationList({ conversations, activeId, onOpen, titleOf, className }: Props) {
    const t = useTranslations('messages');
    const messageTime = useMessageTime();
    const [filter, setFilter] = useState<string | null>(null);

    const groups = useMemo(() => {
        const seen = new Map<string, NonNullable<InboxRow['group']>>();
        for (const c of conversations) if (c.group && !seen.has(c.group.id)) seen.set(c.group.id, c.group);
        return [...seen.values()];
    }, [conversations]);

    // A chip whose group no longer has chats falls back to "All".
    const activeFilter = filter && groups.some(g => g.id === filter) ? filter : null;
    const visible = activeFilter ? conversations.filter(c => c.group?.id === activeFilter) : conversations;

    return (
        <div className={clsx('w-full flex-col border-r border-border bg-surface-elevated/30 sm:w-80', className)}>
            <div className="border-b border-border bg-surface p-4">
                <h1 className="text-lg font-bold">{t('title')}</h1>
                {groups.length > 0 && (
                    <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={t('filterLabel')}>
                        <FilterChip active={!activeFilter} onClick={() => setFilter(null)}>{t('filterAll')}</FilterChip>
                        {groups.map(g => (
                            <FilterChip key={g.id} active={activeFilter === g.id} onClick={() => setFilter(g.id)}>{g.name}</FilterChip>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {visible.length > 0 ? visible.map(conv => (
                    <button
                        key={conv.id}
                        onClick={() => onOpen(conv.id)}
                        className={clsx(
                            'flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors hover:bg-surface-elevated/50',
                            activeId === conv.id && 'bg-surface-elevated'
                        )}
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
                            {conv.other
                                ? <img src={avatarUrl(conv.other)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                : <Users className="h-5 w-5 text-foreground-muted" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className={clsx('truncate text-sm', conv.unread ? 'font-black' : 'font-bold')}>{titleOf(conv)}</span>
                                {conv.lastMessage && (
                                    <span className="ml-2 whitespace-nowrap text-[10px] text-foreground-muted">
                                        {messageTime(conv.lastMessage.createdAt, 'list')}
                                    </span>
                                )}
                            </div>
                            {conv.group && <GroupLabel group={conv.group} className="text-[10px]" />}
                            <p className={clsx('truncate text-xs', conv.unread ? 'font-semibold text-foreground' : 'text-foreground-muted')}>
                                {conv.isBlocked ? (
                                    <span className="flex items-center gap-1 italic text-red-500"><Ban className="h-3 w-3" /> {t('blocked')}</span>
                                ) : (
                                    conv.lastMessage?.content || t('noMessages')
                                )}
                            </p>
                        </div>
                        {conv.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" role="img" aria-label={t('unread')} />}
                    </button>
                )) : (
                    <div className="p-8 text-center text-sm italic text-foreground-muted">{t('emptyInbox')}</div>
                )}
            </div>
        </div>
    );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={clsx(
                'max-w-[10rem] shrink-0 truncate rounded-full border px-3 py-1 text-xs font-bold transition-colors',
                active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-foreground-muted hover:text-foreground'
            )}
        >
            {children}
        </button>
    );
}
