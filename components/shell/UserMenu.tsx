'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, Plus, Settings, User, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, usePathname } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import { signInUrl } from '@/lib/auth-redirect';
import { UI } from '@/lib/constants';
import { ME_PAGES } from '@/lib/navigation';
import { buttonClass } from '@/components/ui/Button';
import { MenuItemButton, MenuItemLink, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';

type Props = {
    user: { id: string; avatarSeed?: string | null; name?: string | null; image?: string | null } | null;
};

const ICON = 'size-[17px] text-foreground-muted';

/** The picture at the end of the header: the profile menu when signed in, the sign-in button when not (AR-14). */
export default function UserMenu({ user }: Props) {
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const { open, rootRef, triggerProps, menuProps } = useMenu();
    const [imageError, setImageError] = useState(false);
    const [signingOut, setSigningOut] = useState(false);

    if (!user) {
        // The sign-in and register pages are the sign-in button's destination already.
        if (pathname.startsWith('/auth')) return null;
        return (
            <Link href={signInUrl(locale, pathname + (search ? `?${search}` : ''))} className={buttonClass('primary', 'shrink-0', 'sm')}>
                {t('signIn')}
            </Link>
        );
    }

    // A broken photo URL falls back to the generated avatar.
    const avatarSrc = avatarUrl(imageError ? { id: user.id, avatarSeed: user.avatarSeed } : user);
    const ownArea = pathname !== '/messages' && ME_PAGES.some((p) => p.match(pathname));

    return (
        <div className="relative shrink-0" ref={rootRef}>
            <button {...triggerProps} aria-label={t('profileMenu')} className="grid size-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <img
                    src={avatarSrc}
                    alt=""
                    className={clsx('size-[30px] rounded-full object-cover md:size-8', (open || ownArea) && 'ring-2 ring-primary ring-offset-2 ring-offset-surface')}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                />
            </button>
            {open && (
                <MenuPanel label={t('profileMenu')} dataUi={UI.profileMenu} {...menuProps}>
                    <MenuItemLink href="/profile" icon={<User aria-hidden className={ICON} />}>{t('myProfile')}</MenuItemLink>
                    <MenuItemLink href="/profile/my-groups" icon={<Users aria-hidden className={ICON} />}>{t('myGroups')}</MenuItemLink>
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
