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
import { FeedbackModeProvider } from './FeedbackModeContext';
import type { OAuthProviderId } from '@/lib/auth-providers';

type ProvidersProps = {
    locale: string;
    /** The viewer's time zone as the server rendered with; the client formats with the same one. */
    timeZone: string;
    messages: AbstractIntlMessages;
    oauthProviders: OAuthProviderId[];
    translateMode: boolean;
    feedbackMode: boolean;
    children: React.ReactNode;
};

export default function Providers({ locale, timeZone, messages, oauthProviders, translateMode, feedbackMode, children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
                <ToastProvider>
                  <AuthProvidersProvider value={oauthProviders}>
                   <TranslateModeProvider value={translateMode}>
                   <FeedbackModeProvider value={feedbackMode}>
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
                   </FeedbackModeProvider>
                   </TranslateModeProvider>
                  </AuthProvidersProvider>
                </ToastProvider>
            </NextIntlClientProvider>
        </SessionProvider>
    );
}
