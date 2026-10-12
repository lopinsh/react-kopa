'use client';

import { useTranslations } from 'next-intl';
import { User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useMessagesInbox } from '@/hooks/useMessagesInbox';
import type { InboxRow } from '@/lib/services/message.service';
import ConversationList from './ConversationList';
import ChatPanel from './ChatPanel';

type Props = {
    initialConversations: InboxRow[];
    currentUserId: string;
    locale: string;
    initialConversationId?: string | null;
};

export default function MessagesLayout({ initialConversations, currentUserId, locale, initialConversationId = null }: Props) {
    const t = useTranslations('messages');
    const { conversations, activeConversation, activeConversationId, messages, titleOf, openConversation, addSent, setBlocked } =
        useMessagesInbox({ initialConversations, currentUserId, locale, initialConversationId });

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
                        onSent={addSent}
                        onBlockedChange={(isBlocked) => setBlocked(activeConversation.id, isBlocked)}
                    />
                )}
            </div>
        </div>
    );
}
