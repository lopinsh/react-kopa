'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Send, User as UserIcon, Users, Ban, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { lv, enUS } from 'date-fns/locale';
import { getMessages, sendMessage, blockConversation, markConversationRead } from '@/actions/message-actions';
import { clsx } from 'clsx';
import { avatarUrl } from '@/lib/avatar';
import { Link } from '@/i18n/routing';
import { EVENT_TIME_ZONE } from '@/lib/constants';
import { pusherClient } from '@/lib/pusher';
import type { InboxRow, MessageView } from '@/lib/services/message.service';

type ChatMessage = Omit<MessageView, 'createdAt'> & { createdAt: Date | string };

type Props = {
    initialConversations: InboxRow[];
    currentUserId: string;
    locale: string;
    initialConversationId?: string | null;
};

export default function MessagesLayout({ initialConversations, currentUserId, locale, initialConversationId = null }: Props) {
    const t = useTranslations('messages');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        initialConversationId && initialConversations.some(c => c.id === initialConversationId) ? initialConversationId : null
    );
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendError, setSendError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const activeIdRef = useRef(activeConversationId);

    const dateLocale = locale === 'lv' ? lv : enUS;

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // What to call a chat: the other person, or the group when the viewer is the one who wrote to it.
    const titleOf = (conv: InboxRow) => conv.viewerIsContact
        ? (conv.group?.name ?? t('deletedGroup'))
        : (conv.other?.name || 'User');

    useEffect(() => {
        activeIdRef.current = activeConversationId;
    }, [activeConversationId]);

    // Live messages. Unsubscribing the channel is left to the page unload: the toast provider shares it.
    useEffect(() => {
        const channel = pusherClient.subscribe(`private-user-${currentUserId}`);

        const onNewMessage = (message: ChatMessage) => {
            const incoming = { ...message, createdAt: new Date(message.createdAt) };
            const isActive = activeIdRef.current === incoming.conversationId;

            if (isActive) {
                setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
                if (incoming.senderId !== currentUserId) void markConversationRead(incoming.conversationId);
            }

            setConversations(prev => {
                const idx = prev.findIndex(c => c.id === incoming.conversationId);
                if (idx === -1) {
                    // A conversation this page has never seen: reload to get its details.
                    window.location.reload();
                    return prev;
                }
                const updated = {
                    ...prev[idx],
                    lastMessage: { id: incoming.id, content: incoming.content, createdAt: incoming.createdAt, senderId: incoming.senderId },
                    unread: !isActive && incoming.senderId !== currentUserId ? true : prev[idx].unread && !isActive
                };
                return [updated, ...prev.filter((_, i) => i !== idx)];
            });
        };

        channel.bind('new-message', onNewMessage);
        return () => {
            channel.unbind('new-message', onNewMessage);
        };
    }, [currentUserId]);

    // Fetch messages when a conversation is selected, and mark it read.
    useEffect(() => {
        if (!activeConversationId) return;

        const load = async () => {
            const result = await getMessages(activeConversationId);
            if (result.success) setMessages(result.data ?? []);
            await markConversationRead(activeConversationId);
            setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, unread: false } : c));
        };
        void load();
    }, [activeConversationId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversationId || !newMessage.trim() || isPending) return;

        startTransition(async () => {
            const result = await sendMessage(activeConversationId, newMessage);
            if (result.success && result.data) {
                const sent = result.data;
                // The realtime event may already have added this message.
                setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
                setNewMessage('');
                setSendError(null);
            } else if (!result.success) {
                setSendError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    const handleBlock = async () => {
        if (!activeConversationId || !activeConversation || !confirm(t('confirmBlock'))) return;

        const newBlockedState = !activeConversation.isBlocked;
        const result = await blockConversation(activeConversationId, newBlockedState);

        if (result.success) {
            setConversations(prev =>
                prev.map(c => c.id === activeConversationId ? { ...c, isBlocked: newBlockedState } : c)
            );
        } else {
            alert(t('blockFailed'));
        }
    };

    const openConversation = (id: string | null) => {
        setSendError(null);
        setMessages([]);
        setActiveConversationId(id);
    };

    const origin = activeConversation?.origin;
    const originKey = origin?.type === 'JOIN_REQUEST' ? 'originJoinRequest' : origin?.type === 'GROUP_CONTACT' ? 'originGroupContact' : null;

    return (
        <div className="flex h-[calc(100dvh-var(--header-height)-4rem)] sm:h-[calc(100dvh-var(--header-height)-8rem)] md:h-[calc(100dvh-var(--header-height)-4rem)] max-w-6xl mx-auto border border-border bg-surface shadow-sm sm:rounded-2xl sm:my-8 overflow-hidden">
            {/* Sidebar List */}
            <div className={clsx(
                "w-full sm:w-80 border-r border-border bg-surface-elevated/30 flex flex-col",
                activeConversationId ? "hidden sm:flex" : "flex"
            )}>
                <div className="p-4 border-b border-border bg-surface font-bold text-lg">
                    {t('title')}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        conversations.map(conv => {
                            const lastMessage = conv.lastMessage;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => openConversation(conv.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-4 border-b border-border text-left transition-colors hover:bg-surface-elevated/50",
                                        activeConversationId === conv.id && "bg-surface-elevated"
                                    )}
                                >
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface flex items-center justify-center">
                                        {conv.other
                                            ? <img src={avatarUrl(conv.other)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                            : <Users className="h-5 w-5 text-foreground-muted" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={clsx("text-sm truncate", conv.unread ? "font-black" : "font-bold")}>{titleOf(conv)}</span>
                                            {lastMessage && (
                                                <span className="text-[10px] text-foreground-muted whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: dateLocale })}
                                                </span>
                                            )}
                                        </div>
                                        {conv.group && !conv.viewerIsContact && (
                                            <span className="block text-[10px] font-bold truncate text-primary">
                                                {conv.group.name}
                                            </span>
                                        )}
                                        <p className={clsx("text-xs truncate", conv.unread ? "text-foreground font-semibold" : "text-foreground-muted")}>
                                            {conv.isBlocked ? (
                                                <span className="text-red-500 italic flex items-center gap-1"><Ban className="h-3 w-3"/> {t('blocked')}</span>
                                            ) : (
                                                lastMessage?.content || t('noMessages')
                                            )}
                                        </p>
                                    </div>
                                    {conv.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-sm text-foreground-muted italic">
                            {t('emptyInbox')}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={clsx(
                "flex-1 flex flex-col bg-surface",
                !activeConversationId ? "hidden sm:flex items-center justify-center" : "flex"
            )}>
                {!activeConversationId || !activeConversation ? (
                    <div className="text-center text-foreground-muted">
                        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{t('selectConversation')}</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-surface z-10">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    className="sm:hidden p-2 -ml-2 text-foreground-muted"
                                    onClick={() => openConversation(null)}
                                >
                                    ←
                                </button>
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-surface flex items-center justify-center">
                                    {activeConversation.other
                                        ? <img src={avatarUrl(activeConversation.other)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        : <Users className="h-4 w-4 text-foreground-muted" />}
                                </div>
                                <div className="min-w-0">
                                    <span className="font-bold block truncate">{titleOf(activeConversation)}</span>
                                    {activeConversation.group && !activeConversation.viewerIsContact && (
                                        <span className="block text-[11px] font-bold truncate text-primary">
                                            {activeConversation.group.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {activeConversation.canBlock && (
                                <button
                                    onClick={handleBlock}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated text-xs font-bold transition-colors hover:bg-surface-elevated/80"
                                >
                                    <Ban className={clsx("h-3.5 w-3.5", activeConversation.isBlocked && "text-red-500")} />
                                    {activeConversation.isBlocked ? t('unblock') : t('block')}
                                </button>
                            )}
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {originKey && origin && (
                                <p className="text-center text-xs text-foreground-muted">
                                    {origin.groupName
                                        ? t.rich(originKey, {
                                            name: origin.groupName,
                                            group: (chunks) => origin.groupHref ? (
                                                <Link href={origin.groupHref} className="font-bold text-primary hover:underline">
                                                    {chunks}
                                                </Link>
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
                                const speaker = !isMe && activeConversation.kind === 'GROUP'
                                    ? (activeConversation.viewerIsContact && activeConversation.group
                                        ? `${msg.sender.name || 'User'} · ${activeConversation.group.name}`
                                        : (msg.sender.name || 'User'))
                                    : null;
                                return (
                                    <div key={msg.id} className={clsx("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                        {speaker && <span className="text-[10px] font-bold text-foreground-muted mb-1 px-1">{speaker}</span>}
                                        <div className={clsx(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            isMe
                                                ? "bg-primary text-white rounded-br-none"
                                                : "bg-surface-elevated text-foreground rounded-bl-none border border-border shadow-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-foreground-muted mt-1 px-1">
                                            {format.dateTime(new Date(msg.createdAt), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT_TIME_ZONE })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-surface">
                            {activeConversation.readOnly ? (
                                <div className="p-3 bg-surface-elevated text-foreground-muted rounded-xl text-center text-sm flex justify-center items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {t('groupGoneNote')}
                                </div>
                            ) : activeConversation.isBlocked ? (
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-center text-sm font-bold flex justify-center items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {t('conversationBlocked')}
                                </div>
                            ) : (
                                <>
                                    {sendError && <p role="alert" className="mb-2 text-xs font-bold text-red-500">{sendError}</p>}
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={t('typeMessage')}
                                            className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm focus:border-primary focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isPending}
                                            className="rounded-xl bg-primary px-5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
