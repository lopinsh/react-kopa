'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const AuthGateModal = dynamic(() => import('../modals/AuthGateModal'), { ssr: false });

type Props = {
    groupName: string;
    groupHref: string;
    isLoggedIn: boolean;
};

/** Shown instead of a 404 when someone opens a members-only event they may not see. Shows nothing about the event itself. */
export default function MembersOnlyNotice({ groupName, groupHref, isLoggedIn }: Props) {
    const t = useTranslations('event.gate');
    const [signInOpen, setSignInOpen] = useState(false);

    return (
        <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-muted">
                <Lock className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
            <p className="mt-4 leading-relaxed text-foreground-muted">
                {isLoggedIn ? t('bodyMember', { group: groupName }) : t('bodyLoggedOut')}
            </p>

            {isLoggedIn ? (
                <Link
                    href={groupHref}
                    className="mt-10 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    {t('goToGroup', { group: groupName })}
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={() => setSignInOpen(true)}
                    className="mt-10 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    {t('signIn')}
                </button>
            )}

            {signInOpen && <AuthGateModal isOpen onClose={() => setSignInOpen(false)} />}
        </div>
    );
}
