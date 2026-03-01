'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: Props) {
    const t = useTranslations('shell.search');
    const td = useTranslations('discovery');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-20">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center border-b border-border px-4 py-3">
                    <Search className="h-5 w-5 text-foreground-muted" />
                    <input
                        autoFocus
                        placeholder={td('searchPlaceholder')}
                        className="flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-foreground-muted"
                    />
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-surface-elevated transition-colors"
                    >
                        <X className="h-5 w-5 text-foreground-muted" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Search className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{t('title')}</h3>
                    <p className="mt-2 text-sm text-foreground-muted">
                        {t('placeholderDesc')}
                    </p>
                </div>

                <div className="border-t border-border bg-surface-elevated/50 px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
                    {t('pressEsc')}
                </div>
            </div>
        </div>
    );
}
