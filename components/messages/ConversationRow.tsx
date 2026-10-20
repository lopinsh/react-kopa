'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import { UI } from '@/lib/constants';
import type { InboxRow } from '@/lib/services/message.service';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import { useMessageTime } from './useMessageTime';
import GroupLabel from './GroupLabel';

type Props = {
    conversation: InboxRow;
    title: string;
    active?: boolean;
    /** A button (the Ziņas page opens the chat in place) or a link (the header list goes to the page). */
    onOpen?: () => void;
    href?: string;
};

/**
 * One chat in a list (AR-64): a group chat shows the group's mark and its category line, a personal one the face and the groups you share;
 * the last message in one line, the time and the unread dot at the right. Used by the Ziņas page and the header's messages list.
 */
export default function ConversationRow({ conversation: conv, title, active = false, onOpen, href }: Props) {
    const t = useTranslations('messages');
    const messageTime = useMessageTime();
    const shared = conv.sharedGroups.join(', ') + (conv.sharedMore > 0 ? ` ${t('sharedMore', { count: conv.sharedMore })}` : '');
    const className = clsx(
        'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-tint/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
        active && 'bg-tint'
    );

    const body: ReactNode = (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full line bg-surface">
                {conv.other
                    ? <img src={avatarUrl(conv.other)} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                    : conv.group ? <CategoryDisc slug={conv.group.l1Slug} color={conv.group.accentColor} size={40} /> : <Users aria-hidden className="size-5 text-foreground-muted" />}
            </span>
            <span className="min-w-0 flex-1">
                <span className={clsx('block truncate text-sm', conv.unread ? 'font-bold' : 'font-medium')}>{title}</span>
                {conv.group && <GroupLabel group={conv.group} showName={!conv.viewerIsContact} className="text-[11px]" />}
                <span className={clsx('block truncate text-xs', conv.unread ? 'font-semibold text-foreground' : 'text-foreground-muted')}>
                    {conv.isBlocked
                        ? <span className="inline-flex items-center gap-1 italic text-danger"><Ban aria-hidden className="size-3" /> {t('blocked')}</span>
                        : conv.lastMessage?.content || t('noMessages')}
                </span>
                {shared && (
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-muted">
                        <Users aria-hidden className="size-3 shrink-0" />
                        <span className="truncate">{shared}</span>
                    </span>
                )}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
                {conv.lastMessage && <span className="whitespace-nowrap text-[11px] text-foreground-muted">{messageTime(conv.lastMessage.createdAt, 'list')}</span>}
                {conv.unread && <span className="size-2.5 rounded-full bg-primary" role="img" aria-label={t('unread')} />}
            </span>
        </>
    );

    return href !== undefined
        ? <Link href={href} data-ui={UI.conversationRow} className={className}>{body}</Link>
        : <button type="button" data-ui={UI.conversationRow} onClick={onOpen} className={className}>{body}</button>;
}
