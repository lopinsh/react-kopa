'use client';

import { useTranslations } from 'next-intl';
import { User, LogOut, Settings, LayoutDashboard, Users } from 'lucide-react';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { signOut, signIn } from 'next-auth/react';
import { Link, usePathname } from '@/i18n/routing';
import { clsx } from 'clsx';
import { avatarUrl } from '@/lib/avatar';
import TranslateModeToggle from '@/components/translate/TranslateModeToggle';
import FeedbackModeToggle from '@/components/feedback/FeedbackModeToggle';
import { inFeedbackLayer } from '@/lib/feedback/capture';

type Props = {
    user: {
        id: string;
        avatarSeed?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        username?: string | null;
        role?: string | null;
    } | null;
};

export default function UserMenu({ user }: Props) {
    const t = useTranslations('nav');
  const c_common = useTranslations('common');
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !inFeedbackLayer(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const [imageError, setImageError] = useState(false);

    if (!mounted) return null;

    if (!user) {
        // The sign-in and register pages are the sign-in button's destination already.
        if (pathname.startsWith('/auth')) return null;
        return (
            <button
                onClick={() => signIn()}
                className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
                {t('signIn')}
            </button>
        );
    }

    // A broken photo URL falls back to the generated avatar.
    const avatarSrc = avatarUrl(imageError ? { id: user.id, avatarSeed: user.avatarSeed } : user);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-elevated transition-all active:scale-95 hover:ring-2 ring-primary/20"
            >
                <img
                    src={avatarSrc}
                    alt={user.name || t('userFallback')}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                />
            </button>

            {mounted && isOpen && (
                <>
                    <div data-ui="dropdown-menu" className="absolute right-0 mt-3 z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="block border-b border-border bg-surface-elevated/50 p-4 hover:bg-surface-elevated transition-colors"
                        >
                            <p className="truncate text-sm font-bold text-foreground">
                                {user.name || t('userFallback')}
                            </p>
                            <p className="truncate text-xs text-foreground-muted">
                                {user.email || ''}
                            </p>
                        </Link>

                        <div className="p-2">
                            {user.role === 'ADMIN' && (
                                <>
                                    <Link
                                        href="/admin"
                                        data-ui="menu-item"
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t('adminPanel')}
                                    </Link>
                                    <TranslateModeToggle
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 transition-colors"
                                        onToggle={() => setIsOpen(false)}
                                    />
                                    <FeedbackModeToggle
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 transition-colors"
                                        onToggle={() => setIsOpen(false)}
                                    />
                                    <div className="my-1 h-px bg-border/40 mx-2" />
                                </>
                            )}

                            <Link
                                href="/profile/my-groups"
                                data-ui="menu-item"
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Users className="h-4 w-4" />
                                {c_common('myGroups')}
                            </Link>

                            <div className="my-1 h-px bg-border/40 mx-2" />

                            {user.username && (
                                <Link
                                    href={`/profile/${user.username}`}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    {t('viewPublicProfile')}
                                </Link>
                            )}
                            <Link
                                href="/profile/edit"
                                data-ui="menu-item"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="h-4 w-4" />
                                {t('settings')}
                            </Link>
                        </div>

                        <div className="border-t border-border p-2">
                            <button
                                data-ui="menu-item"
                                onClick={() => signOut()}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('signOut')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
