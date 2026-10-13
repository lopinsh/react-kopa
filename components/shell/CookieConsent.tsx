'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { X, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CookieConsent() {
    const t = useTranslations('common');
    // Server/hydration snapshot says "already answered" so nothing flashes; the client reads storage.
    const hasConsent = useSyncExternalStore(
        () => () => { },
        () => localStorage.getItem('cookie-consent') !== null,
        () => true
    );
    const [accepted, setAccepted] = useState(false);
    const isVisible = !hasConsent && !accepted;
    const bannerRef = useRef<HTMLDivElement>(null);

    // The banner floats over the page: publish its height so the page keeps room for it (see `<main>` in the locale layout)
    // and the bottom of long forms, like the create wizard, stays reachable until it is answered.
    useEffect(() => {
        const el = bannerRef.current;
        if (!isVisible || !el) return;
        const root = document.documentElement;
        const publish = () => root.style.setProperty('--cookie-banner-h', `${el.offsetHeight + 32}px`);
        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.removeProperty('--cookie-banner-h');
        };
    }, [isVisible]);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setAccepted(true);
    };

    if (!isVisible) return null;

    return (
        <div ref={bannerRef} className="fixed bottom-4 left-4 right-4 z-[48] md:left-auto md:max-w-md">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-primary">
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground">
                            {t('privacyTitle')}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                            {t('privacyDescription')}
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                            <button
                                onClick={handleAccept}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                            >
                                {t('accept')}
                            </button>
                            <Link
                                href="/privacy"
                                className="text-xs font-medium text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4"
                            >
                                {t('learnMore')}
                            </Link>
                        </div>
                    </div>

                    <button
                        onClick={() => setAccepted(true)}
                        className="rounded-lg p-1 text-foreground-muted hover:bg-surface hover:text-foreground transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
