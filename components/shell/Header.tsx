import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import Logo from '@/components/ui/Logo';
import { UI } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import BellButton from '@/components/notifications/BellButton';
import LanguageMenu from './LanguageMenu';
import HeaderSearchField from './HeaderSearchField';
import PhoneSearchButton from './PhoneSearchButton';
import HeaderMessages from './HeaderMessages';
import HeaderLinks from './HeaderLinks';
import { cookies } from 'next/headers';
import { NAV_TAB_COOKIE, isBottomTab } from '@/lib/navigation';

/** The site header (AR-12, AR-13): logo, search field, language, then the signed-in tools. One server read of the session. */
export default async function Header() {
    const t = await getTranslations('shell.header');
    const session = await auth();
    const user = session?.user ?? null;
    const admin = isSiteAdmin(user?.role);
    const navCookie = (await cookies()).get(NAV_TAB_COOKIE)?.value;

    return (
        <header data-ui={UI.header} className="sticky top-0 z-50 flex h-header items-center gap-0.5 border-b border-border bg-surface px-3 md:gap-2 md:px-4">
            <Link href="/" aria-label={t('logoText')} className="flex min-h-10 shrink-0 items-center">
                <span className="md:hidden"><Logo size="sm" /></span>
                <span className="hidden md:inline-flex"><Logo /></span>
            </Link>
            <HeaderLinks initialTab={isBottomTab(navCookie) ? navCookie : 'discover'} signedIn={!!user} />

            {/* Fluid: the field grows in the middle up to the reading width, the tools sit at the right edge. */}
            <div className="flex min-w-0 flex-1 justify-center md:mx-2">
                <HeaderSearchField className="hidden w-full max-w-2xl md:flex" />
            </div>

            <LanguageMenu />
            <PhoneSearchButton />
            {user && admin && <AdminMenu />}
            {user && <HeaderMessages />}
            {user && <BellButton isAdmin={admin} />}
            <UserMenu user={user} />
        </header>
    );
}
