'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send, User as UserIcon, Ban, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { lv, enUS } from 'date-fns/locale';
import { getMessages, sendMessage, blockConversation } from '@/actions/message-actions';
import { clsx } from 'clsx';

type Conversation = {
    id: string;
    isBlocked: boolean;
    participants: { id: string; name: string | null; image: string | null }[];
    messages: { id: string; content: string; createdAt: Date; senderId: string }[];
};

type Props = {
    initialConversations: Conversation[];
    currentUserId: string;
    locale: string;
};

export default function MessagesLayout({ initialConversations, currentUserId, locale }: Props) {
    const t = useTranslations('messages');
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Conversation['messages']>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const dateLocale = locale === 'lv' ? lv : enUS;

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUserId);

    useEffect(() => {
        let isSubscribed = true;
        let pClient: any = null;
        const channelName = `private-user-${currentUserId}`;

        import('@/lib/pusher').then(({ pusherClient }) => {
            if (!isSubscribed) return;
            pClient = pusherClient;

            const channel = pusherClient.subscribe(channelName);

            channel.bind('new-message', (message: { id: string; content: string; createdAt: Date; senderId: string; conversationId: string; }) => {
                // Update active messages if this conversation is open
                if (activeConversationId === message.conversationId) {
                    setMessages(prev => [...prev, message]);
                }

                // Update conversation list preview
                setConversations(prev => {
                    const updated = [...prev];
                    const idx = updated.findIndex(c => c.id === message.conversationId);
                    if (idx > -1) {
                        updated[idx].messages = [message];
                        // Move to top
                        const [conv] = updated.splice(idx, 1);
                        updated.unshift(conv);
                    } else {
                        // It's a new conversation entirely, we should theoretically fetch it
                        // or construct it if we had all the data. For simplicity here:
                        window.location.reload();
                    }
                    return updated;
                });
            });
        });

        return () => {
            isSubscribed = false;
            if (pClient) {
                pClient.unsubscribe(channelName);
                pClient.channel(channelName)?.unbind_all();
            } else {
                import('@/lib/pusher').then(({ pusherClient }) => {
                    pusherClient.unsubscribe(channelName);
                    pusherClient.channel(channelName)?.unbind_all();
                });
            }
        };
    }, [currentUserId, activeConversationId]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (!activeConversationId) return;

        const loadMessages = async () => {
            const result = await getMessages(activeConversationId);
            if (result.success) {
                setMessages(result.data);
            }
        };
        loadMessages();
    }, [activeConversationId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversationId || !newMessage.trim() || isPending) return;

        startTransition(async () => {
            const result = await sendMessage(activeConversationId, newMessage);
            if (result.success) {
                setMessages(prev => [...prev, result.data]);
                setNewMessage('');
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

    return (
        <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto border border-border bg-surface shadow-sm sm:rounded-2xl sm:my-8 overflow-hidden">
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
                            const otherUser = conv.participants.find(p => p.id !== currentUserId);
                            const lastMessage = conv.messages[0];

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-4 border-b border-border text-left transition-colors hover:bg-surface-elevated/50",
                                        activeConversationId === conv.id && "bg-surface-elevated"
                                    )}
                                >
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                                        {otherUser?.image ? (
                                            <img src={otherUser.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-foreground-muted" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm truncate">{otherUser?.name || 'User'}</span>
                                            {lastMessage && (
                                                <span className="text-[10px] text-foreground-muted whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: dateLocale })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground-muted truncate">
                                            {conv.isBlocked ? (
                                                <span className="text-red-500 italic flex items-center gap-1"><Ban className="h-3 w-3"/> {t('blocked')}</span>
                                            ) : (
                                                lastMessage?.content || t('noMessages')
                                            )}
                                        </p>
                                    </div>
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
                {!activeConversationId ? (
                    <div className="text-center text-foreground-muted">
                        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>{t('selectConversation')}</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-surface z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    className="sm:hidden p-2 -ml-2 text-foreground-muted"
                                    onClick={() => setActiveConversationId(null)}
                                >
                                    ←
                                </button>
                                <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-surface">
                                    {otherParticipant?.image ? (
                                        <img src={otherParticipant.image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <UserIcon className="h-4 w-4 text-foreground-muted" />
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold">{otherParticipant?.name || 'User'}</span>
                            </div>

                            <button
                                onClick={handleBlock}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated text-xs font-bold transition-colors hover:bg-surface-elevated/80"
                            >
                                <Ban className={clsx("h-3.5 w-3.5", activeConversation?.isBlocked && "text-red-500")} />
                                {activeConversation?.isBlocked ? t('unblock') : t('block')}
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <div key={msg.id} className={clsx("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                        <div className={clsx(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            isMe
                                                ? "bg-primary text-white rounded-br-none"
                                                : "bg-surface-elevated text-foreground rounded-bl-none border border-border shadow-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-foreground-muted mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-surface">
                            {activeConversation?.isBlocked ? (
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-center text-sm font-bold flex justify-center items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {t('conversationBlocked')}
                                </div>
                            ) : (
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
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
