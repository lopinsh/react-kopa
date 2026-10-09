'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { SessionProvider } from 'next-auth/react';

import RealtimeProvider from './RealtimeProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { ToastContainer } from '../ui/ToastContainer';
import { AuthProvidersProvider } from './AuthProvidersContext';
import type { OAuthProviderId } from '@/lib/auth-providers';

type ProvidersProps = {
    locale: string;
    messages: AbstractIntlMessages;
    oauthProviders: OAuthProviderId[];
    children: React.ReactNode;
};

export default function Providers({ locale, messages, oauthProviders, children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ToastProvider>
                  <AuthProvidersProvider value={oauthProviders}>
                    <RealtimeProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </RealtimeProvider>
                    <ToastContainer />
                  </AuthProvidersProvider>
                </ToastProvider>
            </NextIntlClientProvider>
        </SessionProvider>
    );
}
