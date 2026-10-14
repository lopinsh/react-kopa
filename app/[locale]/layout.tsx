import type { Metadata } from 'next';
import { getMessages, getTimeZone, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NAV_TAB_COOKIE, isBottomTab } from '@/lib/navigation';
import Providers from '@/components/providers/Providers';
import Header from '@/components/shell/Header';
import MobileNav from '@/components/shell/MobileNav';
import CookieConsent from '@/components/shell/CookieConsent';
import { Footer } from '@/components/shell/Footer';
import { getConfiguredOAuthProviders } from '@/lib/auth-providers';
import { isTranslateModeActive } from '@/lib/translate-mode/server';
import TranslateModeLoader from '@/components/translate/TranslateModeLoader';
import { isFeedbackModeActive } from '@/lib/feedback/server';
import FeedbackModeLoader from '@/components/feedback/FeedbackModeLoader';
import { getActiveTheme } from '@/lib/theme/server';
import ThemePreviewBar from '@/components/admin/design/ThemePreviewBar';
import TimeZoneSync from '@/components/shell/TimeZoneSync';

// The title template lives in app/layout.tsx; repeating it here would stack it twice.
export const metadata: Metadata = {
    description: 'Atklāj pasākumus, grupiņas un aktivitātes savā apkārtnē.',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    /** The opened group card and the event panel (R6): intercepted group and event addresses render here, over the page that stays. */
    panel: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, panel, params }: Props) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as 'lv' | 'en')) {
        notFound();
    }

    // The tab a group page marks on a hard load (the tab you came from); client navigation keeps the cookie up to date.
    const navCookie = (await cookies()).get(NAV_TAB_COOKIE)?.value;
    const initialTab = isBottomTab(navCookie) ? navCookie : 'discover';
    const skipToContent = (await getTranslations({ locale, namespace: 'shell' }))('skipToContent');

    const [allMessages, timeZone, translateMode, feedbackMode, theme] = await Promise.all([
        getMessages(),
        getTimeZone(),
        // Only true for a signed-in site admin who switched translation mode on; everyone else gets the page unchanged.
        isTranslateModeActive(),
        // Same for feedback mode: only a site admin who switched it on gets the code.
        isFeedbackModeActive(),
        getActiveTheme(),
    ]);
    // Only a site admin with a saved design preview gets the bar; the colours themselves are set in the root layout.
    const themePreview = theme.isPreview;
    // Admin-only texts are sent by the admin layout, not to every visitor. The one exception is the
    // design preview bar, which a site admin sees on every page while a preview is saved.
    const { admin, ...messages } = allMessages;
    const design = typeof admin === 'object' ? admin.design : undefined;
    if (themePreview && typeof design === 'object') messages.admin = { design: { bar: design.bar } };

    return (
        <Providers locale={locale} timeZone={timeZone} messages={messages} oauthProviders={getConfiguredOAuthProviders()} translateMode={translateMode} feedbackMode={feedbackMode}>
            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
            >
                {skipToContent}
            </a>

            {/* App Shell */}
            <div className="flex h-screen flex-col">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    {/* The scroll container; the page's main element and the slim footer sit inside it. */}
                    <div
                        className="flex-1 overflow-y-auto pb-[calc(5rem+var(--cookie-banner-h,0px))] md:pb-0"
                        id="main-content"
                    >
                        <main id="content" tabIndex={-1} className="focus:outline-none">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </div>
            </div>

            {panel}

            {/* Mobile Bottom Nav */}
            <MobileNav initialTab={initialTab} />

            {/* GDPR Consent */}
            <CookieConsent />
            <TimeZoneSync />

            {translateMode && <TranslateModeLoader />}
            {themePreview && <ThemePreviewBar />}
            {feedbackMode && <FeedbackModeLoader />}
        </Providers>
    );
}
