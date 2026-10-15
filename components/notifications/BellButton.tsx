'use client';

import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, usePathname } from '@/i18n/routing';
import { useOwnCounts } from '@/components/providers/OwnCountsProvider';
import HeaderDropdown from '@/components/shell/HeaderDropdown';
import { ICON_BUTTON } from '@/components/shell/header-styles';
import BellList from './BellList';

/**
 * The header's bell (AR-65): the count in the site colour ("9+" above 9). Phones go straight to Paziņojumi; from 768 px a click opens the
 * last five (a plain link on the page itself). No pulsing: the count is enough.
 */
export default function BellButton({ isAdmin }: { isAdmin: boolean }) {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const { user, admin } = useOwnCounts().notifications;
    const count = user + admin;
    const label = count > 0 ? t('notificationsUnread', { count }) : t('notifications');
    const icon = (
        <>
            <Bell aria-hidden />
            {count > 0 && (
                <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground ring-2 ring-surface">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </>
    );
    const onPage = pathname.startsWith('/notifications');

    return (
        <>
            <Link href="/notifications" aria-label={label} aria-current={onPage ? 'page' : undefined} className={clsx(ICON_BUTTON, onPage && 'bg-tint', 'md:hidden')}>{icon}</Link>
            <div className="hidden md:block">
                {onPage ? (
                    <Link href="/notifications" aria-label={label} title={label} aria-current="page" className={clsx(ICON_BUTTON, 'bg-tint')}>{icon}</Link>
                ) : (
                    <HeaderDropdown label={label} icon={icon}>
                        {({ headingId }) => <BellList headingId={headingId} isAdmin={isAdmin} />}
                    </HeaderDropdown>
                )}
            </div>
        </>
    );
}
