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
        <div className="flex h-[calc(100dvh-var(--header-height)-var(--me-head,0px)-12px-4rem)] overflow-hidden rounded-2xl bg-surface md:h-[calc(100dvh-var(--header-height)-var(--me-head,0px)-18px-24px)] shadow-card frame">
            <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onOpen={openConversation}
                titleOf={titleOf}
                className={activeConversationId ? 'hidden md:flex' : 'flex'}
            />

            {/* Below md one column: the list, and a chat that takes the whole screen (back arrow in its bar). */}
            <div className={clsx('flex flex-1 flex-col bg-surface', activeConversationId ? 'max-md:fixed max-md:inset-0 max-md:z-50 max-md:h-dvh' : 'hidden items-center justify-center md:flex')}>
                {!activeConversation ? (
                    <div className="text-center text-foreground-muted">
                        <UserIcon className="mx-auto mb-4 size-12 opacity-20" />
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
