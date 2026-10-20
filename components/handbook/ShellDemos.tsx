'use client';

import { useTranslations } from 'next-intl';
import { Bell, MessageSquare, Plus, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import Logo from '@/components/ui/Logo';
import { buttonClass } from '@/components/ui/Button';
import { MeProvider } from '@/components/providers/MeProvider';
import AppearanceSetting from '@/components/me/AppearanceSetting';
import MeMenu from '@/components/me/MeMenu';
import PersonHeader from '@/components/me/PersonHeader';
import AdminMenu from '@/components/shell/AdminMenu';
import { Footer } from '@/components/shell/Footer';
import HeaderSearchField from '@/components/shell/HeaderSearchField';
import LanguageMenu from '@/components/shell/LanguageMenu';
import { Cell } from '@/components/shell/MobileNav';
import UserMenu from '@/components/shell/UserMenu';
import { ICON_BUTTON, ICON_DOT } from '@/components/shell/header-styles';
import { BOTTOM_LINKS, type BottomTab } from '@/lib/navigation';

const SAMPLE_USER = { id: 'sample-user', name: 'Ilze', avatarSeed: 'ilze', image: null };
/** The floating panels sit in the flow here, so a specimen shows them open without a click. */
const OPEN = 'min-h-[19rem] [&_[role=menu]]:static!';

/** The header's pieces in a row (the real header is a Server Component over the signed-in session). */
export function HeaderDemo({ signedIn, admin }: { signedIn: boolean; admin?: boolean }) {
    const tNav = useTranslations('nav');
    return (
        <div className="flex h-14 items-center overflow-x-auto gap-2 border-b border-border bg-surface px-3 md:px-4">
            <Logo />
            <div className="mx-2 flex min-w-0 flex-1 justify-center">
                <HeaderSearchField className="flex w-full max-w-2xl" />
            </div>
            <LanguageMenu />
            {signedIn && admin && <span className={ICON_BUTTON}><ShieldCheck aria-hidden /></span>}
            {signedIn && <span className={ICON_BUTTON}><MessageSquare aria-hidden /><span aria-hidden className={ICON_DOT} /></span>}
            {signedIn && <span className={ICON_BUTTON}><Bell aria-hidden /><span aria-hidden className={ICON_DOT} /></span>}
            {signedIn ? <UserMenu user={SAMPLE_USER} /> : <a href="#shellHeader" className={buttonClass('primary', 'shrink-0', 'sm')}>{tNav('signIn')}</a>}
        </div>
    );
}

/** The three header menus, opened. */
export function MenusDemo() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className={clsx('flex justify-end', OPEN)}><UserMenu user={SAMPLE_USER} initialOpen /></div>
            <div className={clsx('flex justify-end', OPEN)}><AdminMenu initialOpen /></div>
            <div className={clsx('flex justify-end', OPEN)}><LanguageMenu initialOpen /></div>
        </div>
    );
}

/** The phone bottom bar, once per marked tab (and once with none marked). */
export function BottomBarDemo() {
    const tCommon = useTranslations('common');
    const marks: (BottomTab | null)[] = [...BOTTOM_LINKS.map((l) => l.tab), null];
    return (
        <div className="grid max-w-sm gap-3 p-4">
            {marks.map((mark) => (
                <div key={mark ?? 'none'} className="flex h-16 border-t border-border bg-surface">
                    {BOTTOM_LINKS.slice(0, 2).map((link) => <Cell key={link.tab} link={link} marked={mark === link.tab} />)}
                    <span className="grid flex-1 place-items-center" aria-label={tCommon('createGroup')}>
                        <span className="grid size-[34px] place-items-center rounded-full text-foreground ring-[1.5px] ring-border"><Plus aria-hidden className="size-5" /></span>
                    </span>
                    {BOTTOM_LINKS.slice(2).map((link) => <Cell key={link.tab} link={link} marked={mark === link.tab} />)}
                </div>
            ))}
        </div>
    );
}

export function FooterDemo() {
    return <Footer always />;
}

/** The own area's head and menu, and the Izskats setting. */
export function OwnAreaDemo() {
    const t = useTranslations('profile.area');
    const sample = { name: 'Ilze', avatarSrc: 'https://api.dicebear.com/10.x/clay/svg?seed=ilze', line: t('groupCount', { count: 3 }) };
    return (
        <MeProvider value={sample}>
            <PersonHeader />
            <div className="grid gap-6 p-4 md:grid-cols-[190px_minmax(0,1fr)]">
                <MeMenu variant="drawer" />
                <AppearanceSetting />
            </div>
        </MeProvider>
    );
}
