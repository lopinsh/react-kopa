'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, usePathname } from '@/i18n/routing';
import MessagesDropdown from '@/components/messages/MessagesDropdown';
import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';
import HeaderDropdown from './HeaderDropdown';
import { ICON_BUTTON, ICON_DOT } from './header-styles';

/**
 * The header's messages icon (desktop): a click opens the last five chats, a dot when something is unread. On /messages it is a plain link
 * to the page itself. Phones use "Ziņas" in the bottom bar.
 */
export default function HeaderMessages() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const count = useUnreadMessages();
    const label = count > 0 ? t('messagesUnread', { count }) : t('messages');
    const icon = (
        <>
            <MessageSquare aria-hidden />
            {count > 0 && <span aria-hidden className={ICON_DOT} />}
        </>
    );

    if (pathname.startsWith('/messages')) {
        return <Link href="/messages" aria-label={label} title={label} aria-current="page" className={clsx(ICON_BUTTON, 'hidden bg-tint md:grid')}>{icon}</Link>;
    }
    return (
        <div className="hidden md:block">
            <HeaderDropdown label={label} icon={icon}>
                {({ headingId }) => <MessagesDropdown headingId={headingId} />}
            </HeaderDropdown>
        </div>
    );
}
