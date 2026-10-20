'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, Plus, Settings, User, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import { signInUrl } from '@/lib/auth-redirect';
import { UI } from '@/lib/constants';
import { ME_PAGES } from '@/lib/navigation';
import { buttonClass } from '@/components/ui/Button';
import { useOwnCounts } from '@/components/providers/OwnCountsProvider';
import { ICON_DOT } from './header-styles';
import { MenuItemButton, MenuItemLink, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';

type Props = {
    initialOpen?: boolean;
    user: { id: string; avatarSeed?: string | null; name?: string | null; image?: string | null } | null;
};

const ICON = 'size-[17px] text-foreground-muted';
const NEW_COUNT_CLASS = 'ml-auto text-tag text-primary';

/** The picture at the end of the header: the profile menu when signed in, the sign-in button when not (AR-14). */
export default function UserMenu({ user, initialOpen }: Props) {
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const { open, rootRef, triggerProps, menuProps } = useMenu(initialOpen);
    const { myGroupsNew } = useOwnCounts();
    const [imageError, setImageError] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    if (!user) {
        // The sign-in and register pages are the sign-in button's destination already.
        if (pathname.startsWith('/auth')) return null;
        // signInUrl already carries the locale prefix, so a plain Next link (the next-intl Link would add it twice).
        return (
            <NextLink href={signInUrl(locale, pathname + (search ? `?${search}` : ''))} className={buttonClass('primary', 'shrink-0', 'sm')}>
                {t('signIn')}
            </NextLink>
        );
    }

    // A broken photo URL falls back to the generated avatar.
    const avatarSrc = avatarUrl(imageError ? { id: user.id, avatarSeed: user.avatarSeed } : user);
    const ownArea = !pathname.startsWith('/messages') && !pathname.startsWith('/notifications') && ME_PAGES.some((p) => p.match(pathname));

    return (
        <div className="relative shrink-0" ref={rootRef}>
            <button {...triggerProps} aria-label={t('profileMenu')} className="relative grid size-10 place-items-center rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <img
                    src={avatarSrc}
                    alt=""
                    className={clsx('size-[30px] rounded-full object-cover md:size-8', (open || ownArea) && 'ring-2 ring-primary ring-offset-2 ring-offset-surface')}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                />
                {myGroupsNew > 0 && <span aria-hidden className={ICON_DOT} />}
            </button>
            {open && (
                <MenuPanel label={t('profileMenu')} dataUi={UI.profileMenu} {...menuProps}>
                    <MenuItemLink href="/profile" icon={<User aria-hidden className={ICON} />}>{t('myProfile')}</MenuItemLink>
                    <MenuItemLink
                        href="/profile/my-groups"
                        icon={<Users aria-hidden className={ICON} />}
                        trailing={myGroupsNew > 0 && (
                            <span className={NEW_COUNT_CLASS}>
                                <span aria-hidden>{myGroupsNew > 9 ? '9+' : myGroupsNew}</span>
                                <span className="sr-only">{t('myGroupsNew', { count: myGroupsNew })}</span>
                            </span>
                        )}
                    >
                        {t('myGroups')}
                    </MenuItemLink>
                    <MenuItemLink href="/create" icon={<Plus aria-hidden className={ICON} />}>{tCommon('createGroup')}</MenuItemLink>
                    <MenuSeparator />
                    <MenuItemLink href="/settings" icon={<Settings aria-hidden className={ICON} />}>{t('settings')}</MenuItemLink>
                    <MenuItemButton
                        disabled={signingOut}
                        icon={<LogOut aria-hidden className={ICON} />}
                        onSelect={() => {
                            setSigningOut(true);
                            void signOut();
                        }}
                    >
                        {t('signOut')}
                    </MenuItemButton>
                </MenuPanel>
            )}
        </div>
    );
}
