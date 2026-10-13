'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import MessagesDrawerButton from '@/components/messages/MessagesDrawerButton';
import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';
import { ICON_BUTTON, ICON_DOT } from './header-styles';

/** The header's messages icon (desktop): opens the drawer, a dot when something is unread. Phones use "Ziņas" in the bottom bar. */
export default function HeaderMessages() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const count = useUnreadMessages();
    const label = count > 0 ? t('messagesUnread', { count }) : t('messages');
    return (
        <MessagesDrawerButton className={clsx(ICON_BUTTON, 'hidden md:grid', pathname.startsWith('/messages') && 'bg-tint')} label={label} title={label}>
            <MessageSquare aria-hidden />
            {count > 0 && <span aria-hidden className={ICON_DOT} />}
        </MessagesDrawerButton>
    );
}
