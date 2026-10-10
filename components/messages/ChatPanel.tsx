'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Users, Ban, AlertCircle, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { sendMessage, blockConversation } from '@/actions/message-actions';
import { avatarUrl } from '@/lib/avatar';
import { Link } from '@/i18n/routing';
import { MESSAGE_MAX_LENGTH, messageTextSchema } from '@/lib/validations/message';
import type { InboxRow, MessageView } from '@/lib/services/message.service';
import { GroupLabel } from './ConversationList';
import { useMessageTime } from './useMessageTime';
import { UI } from '@/lib/constants';

export type ChatMessage = Omit<MessageView, 'createdAt'> & { createdAt: Date | string };

type Props = {
    conversation: InboxRow;
    messages: ChatMessage[];
    currentUserId: string;
    title: string;
    unknownName: string;
    onBack: () => void;
    onSent: (message: ChatMessage) => void;
    onBlockedChange: (isBlocked: boolean) => void;
};

export default function ChatPanel({ conversation, messages, currentUserId, title, unknownName, onBack, onSent, onBlockedChange }: Props) {
    const t = useTranslations('messages');
    const tErrors = useTranslations('errors');
    const messageTime = useMessageTime();
    const [draft, setDraft] = useState('');
    const [sendError, setSendError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const listRef = useRef<HTMLDivElement>(null);

    // Always show the newest message: when a chat opens and whenever one arrives.
    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, conversation.id]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageTextSchema.safeParse(draft).success || isPending) return;

        startTransition(async () => {
            const result = await sendMessage(conversation.id, draft);
            if (result.success && result.data) {
                onSent(result.data);
                setDraft('');
                setSendError(null);
            } else if (!result.success) {
                setSendError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    const handleBlock = async () => {
        if (!confirm(t('confirmBlock'))) return;
        const next = !conversation.isBlocked;
        const result = await blockConversation(conversation.id, next);
        if (result.success) onBlockedChange(next);
        else alert(t('blockFailed'));
    };

    const origin = conversation.origin;
    const originKey = origin?.type === 'JOIN_REQUEST' ? 'originJoinRequest' : origin?.type === 'GROUP_CONTACT' ? 'originGroupContact' : null;

    return (
        <>
            <div className="z-10 flex items-center justify-between border-b border-border bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button className="-ml-2 p-2 text-foreground-muted sm:hidden" onClick={onBack} aria-label={t('back')}>
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
                        {conversation.other
                            ? <img src={avatarUrl(conversation.other)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            : <Users className="h-4 w-4 text-foreground-muted" />}
                    </div>
                    <div className="min-w-0">
                        <span className="block truncate font-bold">{title}</span>
                        {conversation.group && <GroupLabel group={conversation.group} className="text-[11px]" />}
                    </div>
                </div>

                {conversation.canBlock && (
                    <button
                        onClick={handleBlock}
                        className="flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-bold transition-colors hover:bg-surface-elevated/80"
                    >
                        <Ban className={clsx('h-3.5 w-3.5', conversation.isBlocked && 'text-red-500')} />
                        {conversation.isBlocked ? t('unblock') : t('block')}
                    </button>
                )}
            </div>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                {originKey && origin && (
                    <p className="text-center text-xs text-foreground-muted">
                        {origin.groupName
                            ? t.rich(originKey, {
                                name: origin.groupName,
                                group: (chunks) => origin.groupHref ? (
                                    <Link href={origin.groupHref} className="font-bold text-primary hover:underline">{chunks}</Link>
                                ) : (
                                    <span className="font-bold">{chunks}</span>
                                )
                            })
                            : t(`${originKey}Gone`)}
                    </p>
                )}
                {messages.map(msg => {
                    const isMe = msg.senderId === currentUserId;
                    // In a group chat, say who is speaking: the person, or a team member for the group.
                    const senderName = msg.sender.name || unknownName;
                    const speaker = !isMe && conversation.kind === 'GROUP'
                        ? (conversation.viewerIsContact && conversation.group ? `${senderName} · ${conversation.group.name}` : senderName)
                        : null;
                    return (
                        <div key={msg.id} data-ui={UI.chatBubble} className={clsx('flex max-w-[75%] flex-col', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}>
                            {speaker && <span className="mb-1 px-1 text-[10px] font-bold text-foreground-muted">{speaker}</span>}
                            <div className={clsx(
                                'whitespace-pre-wrap break-words rounded-2xl p-3 text-sm leading-relaxed',
                                isMe
                                    ? 'rounded-br-none bg-primary text-white'
                                    : 'rounded-bl-none border border-border bg-surface-elevated text-foreground shadow-sm'
                            )}>
                                {msg.content}
                            </div>
                            <span className="mt-1 px-1 text-[10px] text-foreground-muted">{messageTime(msg.createdAt)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-border bg-surface p-4">
                {conversation.readOnly ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-elevated p-3 text-center text-sm text-foreground-muted">
                        <AlertCircle className="h-4 w-4" />
                        {t('groupGoneNote')}
                    </div>
                ) : conversation.isBlocked ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 p-3 text-center text-sm font-bold text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {t('conversationBlocked')}
                    </div>
                ) : (
                    <>
                        {sendError && <p role="alert" className="mb-2 text-xs font-bold text-red-500">{sendError}</p>}
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                maxLength={MESSAGE_MAX_LENGTH}
                                placeholder={t('typeMessage')}
                                aria-label={t('typeMessage')}
                                className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm focus:border-primary focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!messageTextSchema.safeParse(draft).success || isPending}
                                aria-label={t('send')}
                                className="flex items-center justify-center rounded-xl bg-primary px-5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </>
    );
}
