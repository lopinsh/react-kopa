import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/providers/Providers';
import Header from '@/components/shell/Header';
import Sidebar from '@/components/shell/Sidebar';
import MobileNav from '@/components/shell/MobileNav';
import CookieConsent from '@/components/shell/CookieConsent';
import { Footer } from '@/components/shell/Footer';

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

    const messages = await getMessages();

    return (
        <Providers locale={locale} messages={messages}>
            {/* App Shell */}
            <div className="flex h-screen flex-col">
                <Header />

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar locale={locale} />
                    {/* Main Content */}
                    <main
                        className="flex-1 overflow-y-auto pb-20 md:pb-4"
                        id="main-content"
                    >
                        <div className="flex-1">
                            {children}
                        </div>
                        <Footer locale={locale} />
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* GDPR Consent */}
            <CookieConsent />
        </Providers>
    );
}
