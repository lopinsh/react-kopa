'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ChatPageContext } from '@/lib/services/chat-context.service';

const ChatContext = createContext<ChatPageContext | null>(null);

/** The Čats page's room, its family of rooms and the viewer (K5-09); hydrated from `ChatContextService.pageContext` in `ChatPage` (Context Law). */
export function ChatProvider({ value, children }: { value: ChatPageContext; children: ReactNode }) {
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatPageContext {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
    return ctx;
}
