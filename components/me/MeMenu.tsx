'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link, usePathname } from '@/i18n/routing';
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
                    <Link
                        key={href}
                        href={href}
                        // In the drawer the link takes over the drawer's history entry, so Back returns in one step.
                        replace={variant === 'drawer'}
                        aria-current={current ? 'page' : undefined}
                        className={clsx(
                            'flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-sm text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            current && 'bg-tint font-semibold'
                        )}
                    >
                        <Icon aria-hidden className="size-4 text-foreground-muted" />
                        {t(labelKey)}
                        {count > 0 && (
                            <span className={clsx('ml-auto rounded-full px-2 text-[11px] font-semibold text-foreground-muted', current ? 'bg-surface' : 'bg-tint')}>
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
