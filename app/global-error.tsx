'use client';

import { useEffect } from 'react';
import './globals.css';
import { CloudOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import lv from '@/messages/lv.json';
import en from '@/messages/en.json';

/**
 * The root layout failed: this replaces it, so there is no provider and no server-set theme here. It renders its own
 * document, takes the locale from the URL prefix and reuses the `common.errorState` copy, the same words as the segment error.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    const locale = typeof window !== 'undefined' && /^\/en(\/|$)/.test(window.location.pathname) ? 'en' : 'lv';
    const copy = (locale === 'en' ? en : lv).common.errorState;

    return (
        <html lang={locale}>
            <body className="min-h-screen bg-background antialiased">
                <div className="mx-auto max-w-xl px-4 py-12">
                    <EmptyState
                        icon={CloudOff}
                        title={copy.title}
                        description={copy.text}
                        action={<Button variant="secondary" onClick={retry}>{copy.retry}</Button>}
                    />
                </div>
            </body>
        </html>
    );
}
