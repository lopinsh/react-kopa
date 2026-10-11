'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Link } from '@/i18n/routing';
import TranslateModeToggle from '@/components/translate/TranslateModeToggle';
import FeedbackModeToggle from '@/components/feedback/FeedbackModeToggle';
import { inFeedbackLayer } from '@/lib/feedback/capture';

const ITEM = 'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 transition-colors';

/** Header icon with the site admin's tools. Render it for site admins only; the actions behind it check the role again. */
export default function AdminMenu() {
    const t = useTranslations('nav');
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !inFeedbackLayer(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label={t('adminMenu')}
                title={t('adminMenu')}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground-muted transition-all active:scale-95 hover:bg-surface-elevated hover:text-foreground"
            >
                <ShieldCheck className="h-[22px] w-[22px]" />
            </button>

            {isOpen && (
                <div
                    data-ui="dropdown-menu"
                    role="menu"
                    className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                >
                    <FeedbackModeToggle className={ITEM} onToggle={() => setIsOpen(false)} />
                    <TranslateModeToggle className={ITEM} onToggle={() => setIsOpen(false)} />
                    <div className="my-1 mx-2 h-px bg-border/40" />
                    <Link href="/admin" role="menuitem" data-ui="menu-item" className={ITEM} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 text-foreground-muted" />
                        {t('adminPanel')}
                    </Link>
                </div>
            )}
        </div>
    );
}
