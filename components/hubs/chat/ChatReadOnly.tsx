'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { signInUrl } from '@/lib/auth-redirect';
import type { PublicLine } from '@/lib/services/matrix.service';
import ChatLog from './ChatLog';

const REFRESH_MS = 30_000;

/** Signed out (K-142, K-146): the server's last lines with names, no composer, no card, no profile link; the page asks the server again every 30 s while it is visible. */
export default function ChatReadOnly({ lines }: { lines: PublicLine[] }) {
    const t = useTranslations('hub.chat');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const id = window.setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, REFRESH_MS);
        return () => window.clearInterval(id);
    }, [router]);

    const entries = lines.map((l, i) => ({ id: `${l.ts}-${i}`, sender: l.name ?? '', name: l.name, mod: l.mod, own: false, ts: l.ts, body: l.body }));
    return (
        <>
            <ChatLog entries={entries} />
            <div className="border-t border-border bg-surface p-3">
                {/* A full load: the sign-in page is outside the hub's soft navigation. */}
                <a href={signInUrl(locale, pathname)} className={buttonClass('primary', 'w-full')}>{t('signIn')}</a>
                <p className="mt-2 text-center text-meta text-foreground-muted">{t('readOnly')}</p>
            </div>
        </>
    );
}
