'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getInbox } from '@/actions/message-actions';
import { Link } from '@/i18n/routing';
import { useMessagesInbox } from '@/hooks/useMessagesInbox';
import type { InboxRow } from '@/lib/services/message.service';
import Modal from '@/components/ui/Modal';
import ConversationList from './ConversationList';
import ChatPanel from './ChatPanel';

type Props = {
    onClose: () => void;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/** Quick replies from any page: the inbox and a chat in a drawer from the right. /messages stays the full view. */
export default function MessagesDrawer({ onClose, returnFocusRef }: Props) {
    const t = useTranslations('messages');
    const locale = useLocale();
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [rows, setRows] = useState<InboxRow[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void getInbox(locale).then((result) => {
            if (cancelled) return;
            if (result.success) setRows(result.data ?? []);
            else setFailed(true);
        });
        return () => {
            cancelled = true;
        };
    }, [locale]);

    return (
        <Modal
            onClose={onClose}
            title={t('title')}
            placement="right"
            flush
            closeOnBackdrop
            returnFocusRef={returnFocusRef}
            headerClassName="border-b border-border px-4 py-3"
            titleClassName="text-lg font-bold text-foreground"
        >
            {rows && userId ? (
                <DrawerBody initialConversations={rows} currentUserId={userId} locale={locale} onNavigate={onClose} />
            ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-sm text-foreground-muted" role="status">
                    {failed
                        ? t('drawerLoadFailed')
                        : <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />{t('drawerLoading')}</>}
                </div>
            )}
        </Modal>
    );
}

function DrawerBody({ initialConversations, currentUserId, locale, onNavigate }: {
    initialConversations: InboxRow[];
    currentUserId: string;
    locale: string;
    onNavigate: () => void;
}) {
    const t = useTranslations('messages');
    const { conversations, activeConversation, activeConversationId, messages, titleOf, openConversation, addSent, setBlocked } =
        useMessagesInbox({ initialConversations, currentUserId, locale });

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
                {activeConversation ? (
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
                        alwaysShowBack
                    />
                ) : (
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversationId}
                        onOpen={openConversation}
                        titleOf={titleOf}
                        className="flex min-h-0 flex-1"
                        compact
                    />
                )}
            </div>
            <Link
                href={activeConversation ? { pathname: '/messages', query: { c: activeConversation.id } } : '/messages'}
                onClick={onNavigate}
                className="flex shrink-0 items-center justify-center gap-2 border-t border-border bg-surface px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-surface-elevated"
            >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t('openFullView')}
            </Link>
        </div>
    );
}
