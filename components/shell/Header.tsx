import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import Logo from '@/components/ui/Logo';
import { UI } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import NotificationCenter from './NotificationCenter';
import LanguageMenu from './LanguageMenu';
import HeaderSearchField from './HeaderSearchField';
import PhoneSearchToggle from './PhoneSearchToggle';
import HeaderMessages from './HeaderMessages';

/** The site header (AR-12, AR-13): logo, search field, language, then the signed-in tools. One server read of the session. */
export default async function Header() {
    const t = await getTranslations('shell.header');
    const session = await auth();
    const user = session?.user ?? null;
    const admin = isSiteAdmin(user?.role);

    return (
        <header data-ui={UI.header} className="sticky top-0 z-50 flex h-header items-center gap-0.5 border-b border-border bg-surface px-3 md:gap-2 md:px-4">
            <Link href="/" aria-label={t('logoText')} className="flex min-h-10 shrink-0 items-center">
                <span className="md:hidden"><Logo size="sm" /></span>
                <span className="hidden md:inline-flex"><Logo /></span>
            </Link>

            <HeaderSearchField className="mx-2 hidden max-w-[560px] flex-1 md:flex" />
            <span className="flex-1 md:hidden" />

            <LanguageMenu />
            <PhoneSearchToggle />
            {user && admin && <AdminMenu />}
            {user && <HeaderMessages />}
            {user && <NotificationCenter isAdmin={admin} />}
            <UserMenu user={user} />
        </header>
    );
}
