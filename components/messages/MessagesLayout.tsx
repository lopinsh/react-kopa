'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { getInbox, getMessages, markConversationRead } from '@/actions/message-actions';
import { usePusher } from '@/hooks/usePusher';
import { MESSAGES_READ } from '@/lib/constants/events';
import type { InboxRow } from '@/lib/services/message.service';
import ConversationList from './ConversationList';
import ChatPanel, { type ChatMessage } from './ChatPanel';

type Props = {
    initialConversations: InboxRow[];
    currentUserId: string;
    locale: string;
    initialConversationId?: string | null;
};

export default function MessagesLayout({ initialConversations, currentUserId, locale, initialConversationId = null }: Props) {
    const t = useTranslations('messages');
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        initialConversationId && initialConversations.some(c => c.id === initialConversationId) ? initialConversationId : null
    );
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const activeIdRef = useRef(activeConversationId);
    const knownIdsRef = useRef(new Set(initialConversations.map(c => c.id)));

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // What to call a chat: the other person, or the group when the viewer is the one who wrote to it.
    const titleOf = useCallback((conv: InboxRow) => conv.viewerIsContact
        ? (conv.group?.name ?? t('deletedGroup'))
        : (conv.other?.name || t('unknownUser')), [t]);

    useEffect(() => {
        activeIdRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        knownIdsRef.current = new Set(conversations.map(c => c.id));
    }, [conversations]);

    const markRead = useCallback(async (id: string) => {
        await markConversationRead(id);
        window.dispatchEvent(new Event(MESSAGES_READ));
    }, []);

    // A message for a chat this page has never seen: fetch the inbox again to get its details.
    const refetchInbox = useCallback(async () => {
        const result = await getInbox(locale);
        if (result.success && result.data) {
            const rows = result.data;
            setConversations(rows.map(r => r.id === activeIdRef.current ? { ...r, unread: false } : r));
        }
    }, [locale]);

    usePusher<ChatMessage>(`private-user-${currentUserId}`, 'new-message', (message) => {
        const incoming = { ...message, createdAt: new Date(message.createdAt) };
        const isActive = activeIdRef.current === incoming.conversationId;
        const fromOthers = incoming.senderId !== currentUserId;

        if (isActive) {
            setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
            if (fromOthers) void markRead(incoming.conversationId);
        }

        if (!knownIdsRef.current.has(incoming.conversationId)) {
            void refetchInbox();
            return;
        }
        setConversations(prev => {
            const idx = prev.findIndex(c => c.id === incoming.conversationId);
            if (idx === -1) return prev;
            const updated: InboxRow = {
                ...prev[idx],
                lastMessage: { id: incoming.id, content: incoming.content, createdAt: incoming.createdAt, senderId: incoming.senderId },
                unread: !isActive && fromOthers ? true : prev[idx].unread && !isActive
            };
            return [updated, ...prev.filter((_, i) => i !== idx)];
        });
    });

    // Load the messages when a conversation is opened, and mark it read.
    useEffect(() => {
        if (!activeConversationId) return;
        let cancelled = false;

        const load = async () => {
            const result = await getMessages(activeConversationId);
            if (cancelled) return;
            if (result.success) setMessages(result.data ?? []);
            await markRead(activeConversationId);
            if (!cancelled) setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, unread: false } : c));
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [activeConversationId, markRead]);

    const openConversation = (id: string | null) => {
        setMessages([]);
        setActiveConversationId(id);
    };

    return (
        <div className="mx-auto flex h-[calc(100dvh-var(--header-height)-4rem)] max-w-6xl overflow-hidden border border-border bg-surface shadow-sm sm:my-8 sm:h-[calc(100dvh-var(--header-height)-8rem)] sm:rounded-2xl md:h-[calc(100dvh-var(--header-height)-4rem)]">
            <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onOpen={openConversation}
                titleOf={titleOf}
                className={activeConversationId ? 'hidden sm:flex' : 'flex'}
            />

            <div className={clsx('flex flex-1 flex-col bg-surface', !activeConversationId && 'hidden items-center justify-center sm:flex')}>
                {!activeConversation ? (
                    <div className="text-center text-foreground-muted">
                        <UserIcon className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p>{t('selectConversation')}</p>
                    </div>
                ) : (
                    <ChatPanel
                        key={activeConversation.id}
                        conversation={activeConversation}
                        messages={messages}
                        currentUserId={currentUserId}
                        title={titleOf(activeConversation)}
                        unknownName={t('unknownUser')}
                        onBack={() => openConversation(null)}
                        onSent={(sent) => setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent])}
                        onBlockedChange={(isBlocked) =>
                            setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, isBlocked } : c))}
                    />
                )}
            </div>
        </div>
    );
}
