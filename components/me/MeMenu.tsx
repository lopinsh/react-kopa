'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import PageNavLink from '@/components/ui/PageNavLink';
import { UI } from '@/lib/constants';
import { ME_PAGES } from '@/lib/navigation';
import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';

/** The pages of your own area (AR-60): down the left on desktop (`side`), in the drawer on phones (`drawer`). */
export default function MeMenu({ variant }: { variant: 'side' | 'drawer' }) {
    const t = useTranslations('nav');
    const tArea = useTranslations('profile.area');
    const pathname = usePathname();
    const unread = useUnreadMessages();

    return (
        <nav data-ui={UI.ownMenu} aria-label={tArea('label')} className={clsx('flex-col gap-0.5', variant === 'side' ? 'sticky top-[18px] hidden self-start md:flex' : 'flex pt-2')}>
            {ME_PAGES.map(({ href, labelKey, icon: Icon, match, badge }) => {
                const current = match(pathname);
                const count = badge === 'messages' ? unread : 0;
                return (
                    <PageNavLink key={href} href={href} icon={Icon} label={t(labelKey)} current={current} badge={count} replace={variant === 'drawer'} />
                );
            })}
        </nav>
    );
}
