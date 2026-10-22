'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { InboxRow } from '@/lib/services/message.service';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';
import { UI } from '@/lib/constants';
import ConversationRow from './ConversationRow';

type Props = {
    conversations: InboxRow[];
    activeId: string | null;
    onOpen: (id: string) => void;
    titleOf: (conv: InboxRow) => string;
    className?: string;
};

type Filter = 'ALL' | InboxRow['kind'];

/** Chats by kind: personal (two people) or group chats. One chip per group would fill up fast. */
const FILTERS: Array<{ value: Filter; labelKey: 'filterAll' | 'filterPersonal' | 'filterGroups' }> = [
    { value: 'ALL', labelKey: 'filterAll' },
    { value: 'DIRECT', labelKey: 'filterPersonal' },
    { value: 'GROUP', labelKey: 'filterGroups' }
];

/** The chats of the Ziņas page: the name, the filter chips (Visas · Personīgās · Grupu) and the rows (AR-64). */
export default function ConversationList({ conversations, activeId, onOpen, titleOf, className }: Props) {
    const t = useTranslations('messages');
    const [filter, setFilter] = useState<Filter>('ALL');

    const visible = useMemo(
        () => filter === 'ALL' ? conversations : conversations.filter(c => c.kind === filter),
        [conversations, filter]
    );

    return (
        <div data-ui={UI.conversationList} className={clsx('w-full flex-col border-border bg-surface md:w-80 md:border-r', className)}>
            <div className="border-b border-border p-4">
                <h1 className="text-title">{t('title')}</h1>
                {conversations.length > 0 && (
                    <div className="mt-3 flex gap-2" role="group" aria-label={t('filterLabel')}>
                        {FILTERS.map(({ value, labelKey }) => (
                            <FilterChip key={value} active={filter === value} onClick={() => setFilter(value)}>{t(labelKey)}</FilterChip>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {visible.length > 0 ? visible.map(conv => (
                    <ConversationRow key={conv.id} conversation={conv} title={titleOf(conv)} active={activeId === conv.id} onOpen={() => onOpen(conv.id)} />
                )) : conversations.length > 0 ? (
                    <p className="p-8 text-center text-body-sm italic text-foreground-muted">{t('filterEmpty')}</p>
                ) : (
                    <EmptyState icon={MessageSquare} title={t('emptyTitle')} description={t('emptyText')} />
                )}
            </div>
        </div>
    );
}
