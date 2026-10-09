'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const AuthGateModal = dynamic(() => import('../modals/AuthGateModal'), { ssr: false });

/** Small "if you are a member, sign in" line for the 404 page (shown to logged-out visitors only). */
export default function SignInHint() {
    const t = useTranslations('pages.notFound');
    const [open, setOpen] = useState(false);

    return (
        <p className="mt-6 text-sm text-foreground-muted">
            {t('signInHint')}{' '}
            <button type="button" onClick={() => setOpen(true)} className="font-semibold text-primary hover:underline">
                {t('signInLink')}
            </button>
            {open && <AuthGateModal isOpen onClose={() => setOpen(false)} />}
        </p>
    );
}
