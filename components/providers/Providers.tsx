'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { SessionProvider } from 'next-auth/react';

import RealtimeProvider from './RealtimeProvider';
import { UnreadMessagesProvider } from './UnreadMessagesProvider';
import { OwnCountsProvider } from './OwnCountsProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { ToastContainer } from '../ui/ToastContainer';
import { AuthProvidersProvider } from './AuthProvidersContext';
import { FeedbackModeProvider } from './FeedbackModeContext';
import { AdminPanelProvider } from './AdminPanelContext';
import { AdminGroupProvider } from './AdminGroupContext';
import type { AdminPanelTab } from '@/lib/constants';
import type { OAuthProviderId } from '@/lib/auth-providers';

type ProvidersProps = {
    locale: string;
    /** The viewer's time zone as the server rendered with; the client formats with the same one. */
    timeZone: string;
    messages: AbstractIntlMessages;
    oauthProviders: OAuthProviderId[];
    /** The admin tool panel's open tab (site admins only); the translate and feedback flags derive from it. */
    panelTab: AdminPanelTab | null;
    children: React.ReactNode;
};

export default function Providers({ locale, timeZone, messages, oauthProviders, panelTab, children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
                <ToastProvider>
                  <AuthProvidersProvider value={oauthProviders}>
                   <AdminPanelProvider value={panelTab}>
                   <AdminGroupProvider>
                   <FeedbackModeProvider value={panelTab === 'feedback'}>
                    <RealtimeProvider>
                      <UnreadMessagesProvider>
                       <OwnCountsProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                       </OwnCountsProvider>
                      </UnreadMessagesProvider>
                    </RealtimeProvider>
                    <ToastContainer />
                   </FeedbackModeProvider>
                   </AdminGroupProvider>
                   </AdminPanelProvider>
                  </AuthProvidersProvider>
                </ToastProvider>
            </NextIntlClientProvider>
        </SessionProvider>
    );
}
