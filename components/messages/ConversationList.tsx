'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { avatarUrl } from '@/lib/avatar';
import type { InboxRow } from '@/lib/services/message.service';
import FilterChip from '@/components/ui/FilterChip';
import { useMessageTime } from './useMessageTime';
import { UI } from '@/lib/constants';

type Props = {
    conversations: InboxRow[];
    activeId: string | null;
    onOpen: (id: string) => void;
    titleOf: (conv: InboxRow) => string;
    className?: string;
    /** The drawer: one column at full width, its own heading above. */
    compact?: boolean;
};

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

type Filter = 'ALL' | InboxRow['kind'];

/** Chats by kind: personal (two people) or group chats. One chip per group would fill up fast. */
const FILTERS: Array<{ value: Filter; labelKey: 'filterAll' | 'filterPersonal' | 'filterGroups' }> = [
    { value: 'ALL', labelKey: 'filterAll' },
    { value: 'DIRECT', labelKey: 'filterPersonal' },
    { value: 'GROUP', labelKey: 'filterGroups' }
];

/**
 * A group conversation's category line: the group's category in its colour, its sub-categories smaller and lighter after it.
 * The name is left out where the row's title already is the group. Titles and colour are resolved on the server (Taxonomy Law).
 */
export function GroupLabel({ group, showName = true, className }: { group: NonNullable<InboxRow['group']>; showName?: boolean; className?: string }) {
    const vars: CssVars = { '--group-color': group.accentColor };
    return (
        <span style={vars} className={clsx('flex items-center gap-1.5 truncate', className)}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--group-color)]" aria-hidden="true" />
            <span className="truncate">
                {showName && <span className="font-bold text-foreground-muted">{group.name} · </span>}
                <span className="font-bold text-[color:color-mix(in_srgb,var(--group-color)_65%,var(--foreground))]">{group.categoryTitle}</span>
                {group.subCategories.length > 0 && <span className="font-normal text-foreground-muted"> {group.subCategories.join(', ')}</span>}
            </span>
        </span>
    );
}

export default function ConversationList({ conversations, activeId, onOpen, titleOf, className, compact = false }: Props) {
    const t = useTranslations('messages');
    const messageTime = useMessageTime();
    const [filter, setFilter] = useState<Filter>('ALL');

    const visible = useMemo(
        () => filter === 'ALL' ? conversations : conversations.filter(c => c.kind === filter),
        [conversations, filter]
    );

    return (
        <div data-ui={UI.conversationList} className={clsx('w-full flex-col bg-surface-elevated/30', !compact && 'border-r border-border sm:w-80', className)}>
            <div className={clsx('border-b border-border bg-surface', compact ? 'px-4 py-3' : 'p-4', compact && conversations.length === 0 && 'hidden')}>
                {!compact && <h1 className="text-lg font-bold">{t('title')}</h1>}
                {conversations.length > 0 && (
                    <div className={clsx('flex gap-2', !compact && 'mt-3')} role="group" aria-label={t('filterLabel')}>
                        {FILTERS.map(({ value, labelKey }) => (
                            <FilterChip key={value} active={filter === value} onClick={() => setFilter(value)}>{t(labelKey)}</FilterChip>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {visible.length > 0 ? visible.map(conv => (
                    <button
                        key={conv.id}
                        data-ui={UI.chatListItem}
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
                            {conv.group && <GroupLabel group={conv.group} showName={!conv.viewerIsContact} className="text-[10px]" />}
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
                    <div className="p-8 text-center text-sm italic text-foreground-muted">
                        {conversations.length > 0 ? t('filterEmpty') : t('emptyInbox')}
                    </div>
                )}
            </div>
        </div>
    );
}
