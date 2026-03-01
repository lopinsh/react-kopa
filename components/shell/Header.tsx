import { getTranslations } from 'next-intl/server';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import UserMenu from './UserMenu';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';

type Props = {
    locale: string;
};

export default async function Header({ locale }: Props) {
    const t = await getTranslations('shell.header');
    const session = await auth();

    return (
        <header
            className="sticky top-0 z-50 flex h-header w-full items-center justify-between border-b border-border/40 bg-background/60 px-4 sm:px-6 backdrop-blur-xl transition-all duration-300 shadow-premium"
            role="banner"
        >
            {/* Left Identity Area */}
            <div className="flex items-center shrink-0">
                <Link
                    href="/"
                    className="group relative flex items-center gap-2 pr-1.5 transition-all active:scale-95"
                    aria-label={t('logoText')}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span
                            className="relative flex h-8 w-8 items-center justify-center rounded-xl text-[12px] font-black text-white shadow-xl transition-all duration-500 ease-out group-hover:rotate-3 group-hover:scale-105 sm:h-8.5 sm:w-8.5 sm:text-[13px]"
                            style={{ backgroundColor: 'var(--group-accent, var(--primary))' }}
                        >
                            EK
                        </span>
                    </div>
                    <div className="flex flex-col leading-tight py-0.5">
                        <span className="hidden text-[12px] font-black uppercase tracking-[0.1em] text-foreground sm:block md:text-[13px] md:tracking-[0.15em]">
                            {t('logoText')}
                        </span>
                        <span className="hidden text-[8px] font-bold text-foreground-muted sm:block opacity-60 md:text-[9px]">
                            {t('logoSubtitle')}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Center Area — Global Search */}
            <div className="flex-1 flex justify-center min-w-0 max-w-2xl px-2 sm:px-4">
                <GlobalSearch />
            </div>

            {/* Right side controls */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Global Utilities Group: Language & Theme */}
                <div className="flex h-9 items-center gap-0.5 p-0.5 sm:h-10 sm:p-1 rounded-xl border border-border/30 bg-surface-elevated/40 backdrop-blur-sm">
                    <LanguageSwitcher />
                    <div className="h-4 w-px bg-border/20 mx-0.5" />
                    <ThemeToggle />
                </div>

                {session?.user && (
                    <div className="flex items-center gap-1.5">
                        <div className="hidden sm:block h-5 w-px bg-border/20 mx-0.5" />
                        <NotificationCenter locale={locale} />
                    </div>
                )}

                <div className="hidden sm:block h-5 w-px bg-border/20 mx-0.5" />
                <UserMenu user={session?.user ?? null} />
            </div>
        </header>
    );
}
