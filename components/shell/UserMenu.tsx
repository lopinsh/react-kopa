'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { User, LogOut, Settings, LayoutDashboard, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { clsx } from 'clsx';

type Props = {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        username?: string | null;
    } | null;
};

export default function UserMenu({ user }: Props) {
    const t = useTranslations('nav');
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const [imageError, setImageError] = useState(false);

    if (!user) {
        return (
            <a
                href="/api/auth/signin"
                className="flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
                {t('signIn')}
            </a>
        );
    }

    const isValidImageUrl = user.image?.startsWith('http') || user.image?.startsWith('/') || user.image?.startsWith('data:');

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-elevated transition-all active:scale-95 hover:ring-2 ring-primary/20"
            >
                {user.image && isValidImageUrl && !imageError ? (
                    <Image
                        src={user.image}
                        alt={user.name || t('userFallback')}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized={user.image.includes('.svg') || user.image.includes('api.dicebear.com')}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-elevated">
                        <User className="h-5 w-5 text-foreground-muted" />
                    </div>
                )}
            </button>

            {mounted && isOpen && (
                <>
                    <div className="absolute right-0 mt-3 z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-100">
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
                            <Link
                                href="/profile/my-groups"
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Users className="h-4 w-4" />
                                {t('myGroups')}
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
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="h-4 w-4" />
                                {t('settings')}
                            </Link>
                        </div>

                        <div className="border-t border-border p-2">
                            <button
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
