'use client';

import { NextIntlClientProvider, useLocale, useMessages, useTimeZone, type AbstractIntlMessages } from 'next-intl';

/** Adds the admin-only texts to the site's messages (the root layout leaves them out for everyone else). */
export default function AdminMessagesProvider({ adminMessages, children }: { adminMessages: AbstractIntlMessages; children: React.ReactNode }) {
    const parent = useMessages();
    return (
        <NextIntlClientProvider locale={useLocale()} timeZone={useTimeZone()} messages={{ ...parent, admin: adminMessages }}>
            {children}
        </NextIntlClientProvider>
    );
}
