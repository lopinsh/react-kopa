'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { SessionProvider } from 'next-auth/react';

import RealtimeProvider from './RealtimeProvider';
import { ToastProvider } from '@/hooks/use-toast';
import { ToastContainer } from '../ui/ToastContainer';

type ProvidersProps = {
    locale: string;
    messages: AbstractIntlMessages;
    children: React.ReactNode;
};

export default function Providers({ locale, messages, children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <ToastProvider>
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
                </ToastProvider>
            </NextIntlClientProvider>
        </SessionProvider>
    );
}
