'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { safeCallbackPath } from '@/lib/auth-redirect';
import Modal from '@/components/ui/Modal';

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
        <Modal
            onClose={onClose}
            size="md"
            title={t('modalTitle')}
        >
            <p className="mb-6 text-sm leading-relaxed text-foreground-muted">{t('modalDesc')}</p>

            <SignInForm callbackUrl={callbackUrl} />
        </Modal>
    );
}
