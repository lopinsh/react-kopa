'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getInbox, getMessages, markConversationRead } from '@/actions/message-actions';
import { useRealtimeEvent } from '@/components/providers/RealtimeProvider';
import { MESSAGES_READ } from '@/lib/constants/events';
import type { InboxRow } from '@/lib/services/message.service';
import type { ChatMessage } from '@/components/messages/ChatPanel';

type Options = {
    initialConversations: InboxRow[];
    currentUserId: string;
    locale: string;
    initialConversationId?: string | null;
};

/**
 * State of the messages UI (full page and drawer): the inbox, the open chat and its messages.
 * Loads a chat's messages when it opens, marks it read, and applies live `new-message` events.
 */
export function useMessagesInbox({ initialConversations, currentUserId, locale, initialConversationId = null }: Options) {
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

    const markDeleted = useCallback((id: string, conversationId: string) => {
        const deletedAt = new Date();
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content: '', deletedAt } : m));
        setConversations(prev => prev.map(c => c.id === conversationId && c.lastMessage?.id === id
            ? { ...c, lastMessage: { ...c.lastMessage, content: '', deletedAt } }
            : c));
    }, []);

    // The sender deleted a message: blank it here too, and in the list preview when it was the last one.
    useRealtimeEvent<{ id: string; conversationId: string }>('message-deleted', ({ id, conversationId }) => {
        markDeleted(id, conversationId);
    });

    useRealtimeEvent<ChatMessage>('new-message', (message) => {
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
                lastMessage: { id: incoming.id, content: incoming.content, createdAt: incoming.createdAt, deletedAt: null, senderId: incoming.senderId },
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

    const openConversation = useCallback((id: string | null) => {
        setMessages([]);
        setActiveConversationId(id);
    }, []);

    /** "Dzēst sarunu" went through: the chat leaves this person's list and closes. */
    const removeConversation = useCallback((id: string) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        setMessages([]);
        setActiveConversationId(null);
        window.dispatchEvent(new Event(MESSAGES_READ));
    }, []);

    const addSent = useCallback((sent: ChatMessage) => {
        setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
    }, []);

    const setBlocked = useCallback((id: string, isBlocked: boolean) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, isBlocked } : c));
    }, []);

    return { conversations, activeConversation, activeConversationId, messages, titleOf, openConversation, addSent, setBlocked, markDeleted, removeConversation };
}
