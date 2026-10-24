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
import { getAdminPanelTab } from '@/lib/admin-panel/server';
import AdminPanelLoader from '@/components/admin-panel/AdminPanelLoader';
import { getActiveTheme } from '@/lib/theme/server';
import ThemePreviewBar from '@/components/admin/design/ThemePreviewBar';
import TimeZoneSync from '@/components/shell/TimeZoneSync';
import PanelOriginListener from '@/components/panels/PanelOriginListener';

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

    const [allMessages, timeZone, panelTab, theme] = await Promise.all([
        getMessages(),
        getTimeZone(),
        // Only a signed-in site admin with the tool panel open gets a tab; everyone else gets the page unchanged.
        getAdminPanelTab(),
        getActiveTheme(),
    ]);
    // Only a site admin with a saved design preview gets the bar; the colours themselves are set in the root layout.
    const themePreview = theme.isPreview;
    // Admin-only texts are sent by the admin layout, not to every visitor. The one exception is the
    // design preview bar, which a site admin sees on every page while a preview is saved.
    const { admin, ...messages } = allMessages;
    const design = typeof admin === 'object' ? admin.design : undefined;
    if (typeof admin === 'object' && panelTab) messages.admin = { panel: admin.panel, ...(typeof design === 'object' ? { design: { bar: design.bar } } : {}) };
    else if (themePreview && typeof design === 'object') messages.admin = { design: { bar: design.bar } };

    return (
        <Providers locale={locale} timeZone={timeZone} messages={messages} oauthProviders={getConfiguredOAuthProviders()} panelTab={panelTab}>
            <a /* ui-allow: skip link, visible only on focus */
                href="#content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-button focus:text-primary-foreground"
            >
                {skipToContent}
            </a>

            {/* App Shell */}
            <div data-shell className="flex h-dvh flex-col">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    {/* The scroll container; the page's main element and the slim footer sit inside it. Positioned, so a visually hidden heading far down a page stays inside it instead of stretching the document. */}
                    <div
                        className="relative flex flex-1 flex-col overflow-y-auto pb-[calc(4rem+var(--cookie-banner-h,0px))] [scrollbar-gutter:stable] md:pb-0"
                        id="main-content"
                    >
                        <main id="content" tabIndex={-1} className="flex-1 focus:outline-none">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </div>
            </div>

            {panel}
            <PanelOriginListener />

            {/* Mobile Bottom Nav */}
            <MobileNav initialTab={initialTab} />

            {/* GDPR Consent */}
            <CookieConsent />
            <TimeZoneSync />

            {panelTab && <AdminPanelLoader tab={panelTab} draftActive={themePreview} />}
            {themePreview && !panelTab && <ThemePreviewBar />}
        </Providers>
    );
}
