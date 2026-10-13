import { getTranslations } from 'next-intl/server';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import NotificationCenter from './NotificationCenter';
import { MessageSquare } from 'lucide-react';
import UnreadBadge from './UnreadBadge';
import Logo from '@/components/ui/Logo';
import MessagesDrawerButton from '@/components/messages/MessagesDrawerButton';
import { UI } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';

export default async function Header() {
    const t = await getTranslations('shell.header');
    const session = await auth();

    return (
        <header
            data-ui={UI.header}
            className="sticky top-0 z-50 flex h-header w-full items-center justify-between border-b border-border/40 bg-background/60 px-4 sm:px-6 backdrop-blur-xl transition-all duration-300"
            role="banner"
        >
            {/* Left Identity Area */}
            <div className="flex items-center shrink-0">
                <Link
                    href="/"
                    className="flex min-h-10 min-w-10 items-center transition-all active:scale-95"
                    aria-label={t('logoText')}
                >
                    {/* Phones: the circles only, until R2a frees room in the header (the wordmark pushed the icons off a 375 px screen). */}
                    <span className="sm:hidden"><Logo size="sm" iconOnly /></span>
                    <span className="hidden sm:inline-flex md:hidden"><Logo size="sm" /></span>
                    <span className="hidden md:inline-flex"><Logo /></span>
                </Link>
            </div>

            <div className="flex-1" />

            {/* Right side controls */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Global Utilities Group: Language & Theme */}
                <div className="flex h-9 items-center gap-0.5 p-0.5 sm:h-10 sm:p-1 rounded-xl border border-border/30 bg-surface-elevated/40 backdrop-blur-sm">
                    <LanguageSwitcher />
                    <div className="h-4 w-px bg-border/20 mx-0.5" />
                    <ThemeToggle />
                </div>

                {session?.user && (
                    <div className="flex items-center sm:gap-1.5">
                        <div className="hidden sm:block h-5 w-px bg-border/20 mx-0.5" />
                        <MessagesDrawerButton
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted transition-all active:scale-95 hover:bg-surface-elevated hover:text-foreground"
                            label={t('messages')}
                            title={t('messages')}
                        >
                            <MessageSquare className="h-[22px] w-[22px]" />
                            <UnreadBadge />
                        </MessagesDrawerButton>
                        {isSiteAdmin(session.user.role) && <AdminMenu />}
                        <NotificationCenter isAdmin={isSiteAdmin(session.user.role)} />
                    </div>
                )}

                <div className="hidden sm:block h-5 w-px bg-border/20 mx-0.5" />
                <UserMenu user={session?.user ?? null} />
            </div>
        </header>
    );
}
