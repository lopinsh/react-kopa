import type { Metadata } from 'next';
import { getMessages, getTimeZone } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers/Providers';
import Header from '@/components/shell/Header';
import Sidebar from '@/components/shell/Sidebar';
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
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as 'lv' | 'en')) {
        notFound();
    }

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
            {/* App Shell */}
            <div className="flex h-screen flex-col">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    {/* Main Content */}
                    <main
                        className="flex-1 overflow-y-auto pb-[calc(5rem+var(--cookie-banner-h,0px))] md:pb-4 focus:outline-none"
                        id="main-content"
                    >
                        <div className="flex-1">
                            {children}
                        </div>
                        <Footer />
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* GDPR Consent */}
            <CookieConsent />
            <TimeZoneSync />

            {translateMode && <TranslateModeLoader />}
            {themePreview && <ThemePreviewBar />}
            {feedbackMode && <FeedbackModeLoader />}
        </Providers>
    );
}
