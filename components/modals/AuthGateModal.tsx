'use client';

import { useLocale, useTranslations } from 'next-intl';
import { X, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { safeCallbackPath } from '@/lib/auth-redirect';
import { UI } from '@/lib/constants';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

/** Sign-in pop-up for actions inside the site, so people stay on the page they were on. */
export default function AuthGateModal({ isOpen, onClose }: Props) {
    const t = useTranslations('auth');
    const locale = useLocale();
    const pathname = usePathname();

    if (!isOpen) return null;

    const callbackUrl = safeCallbackPath(pathname, `/${locale}`);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
            <div data-ui={UI.modal} className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <LogIn className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{t('modalTitle')}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('close')}
                        className="rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface-elevated"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-foreground-muted">{t('modalDesc')}</p>

                <SignInForm callbackUrl={callbackUrl} />
            </div>
        </div>
    );
}
