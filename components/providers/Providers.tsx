'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { SessionProvider } from 'next-auth/react';

import RealtimeProvider from './RealtimeProvider';
import { UnreadMessagesProvider } from './UnreadMessagesProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { ToastContainer } from '../ui/ToastContainer';
import { AuthProvidersProvider } from './AuthProvidersContext';
import { TranslateModeProvider } from './TranslateModeContext';
import type { OAuthProviderId } from '@/lib/auth-providers';

type ProvidersProps = {
    locale: string;
    messages: AbstractIntlMessages;
    oauthProviders: OAuthProviderId[];
    translateMode: boolean;
    children: React.ReactNode;
};

export default function Providers({ locale, messages, oauthProviders, translateMode, children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ToastProvider>
                  <AuthProvidersProvider value={oauthProviders}>
                   <TranslateModeProvider value={translateMode}>
                    <RealtimeProvider>
                      <UnreadMessagesProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                      </UnreadMessagesProvider>
                    </RealtimeProvider>
                    <ToastContainer />
                   </TranslateModeProvider>
                  </AuthProvidersProvider>
                </ToastProvider>
            </NextIntlClientProvider>
        </SessionProvider>
    );
}
