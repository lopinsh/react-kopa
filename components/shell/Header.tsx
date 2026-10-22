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
        <header data-ui={UI.header} className="sticky top-0 z-50 flex h-header items-center gap-0.5 border-b border-border bg-surface px-3 md:gap-2 md:px-gutter">
            <Link href="/" data-header-brand aria-label={t('logoText')} className="order-1 flex min-h-10 shrink-0 items-center">
                <span className="md:hidden"><Logo size="sm" /></span>
                <span className="hidden md:inline-flex"><Logo /></span>
            </Link>

            {/* Fluid: the field grows in the middle up to the reading width, the tools sit at the right edge. From lg the links follow the field (visual order by `order`, DOM order = tab order). */}
            <div data-header-slot className="order-3 flex min-w-0 flex-1 justify-center md:mx-2">
                <HeaderSearchField className="hidden w-full max-w-2xl md:flex" />
            </div>
            <HeaderLinks initialTab={isBottomTab(navCookie) ? navCookie : 'discover'} signedIn={!!user} />

            <div className="order-5 flex items-center gap-0.5 md:gap-2">
                <LanguageMenu />
                <PhoneSearchButton />
                {user && admin && <AdminMenu />}
                {user && <HeaderMessages />}
                {user && <BellButton isAdmin={admin} />}
                <UserMenu user={user} />
            </div>
        </header>
    );
}
