'use client';

import { useTranslations } from 'next-intl';
import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';

/** Small count bubble for the Messages nav items; renders nothing when everything is read. */
export default function UnreadBadge() {
    const t = useTranslations('messages');
    const count = useUnreadMessages();
    if (count <= 0) return null;
    return (
        <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black leading-none text-white"
            aria-label={t('unreadBadge', { count })}
        >
            {count > 9 ? '9+' : count}
        </span>
    );
}
