'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { safeCallbackPath } from '@/lib/auth-redirect';
import Modal from '@/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    /** Why sign-in is asked: the sentence under the title names it ("Eju" and "Pieteikties" say join). */
    reason?: 'contact' | 'join';
    /** Where sign-in returns to (a path with locale and query); default the current page. */
    returnTo?: string;
};

/** Sign-in pop-up for actions inside the site, so people stay on the page they were on. */
export default function AuthGateModal({ isOpen, onClose, reason = 'contact', returnTo }: Props) {
    const t = useTranslations('auth');
    const locale = useLocale();
    const pathname = usePathname();

    if (!isOpen) return null;

    const callbackUrl = safeCallbackPath(returnTo ?? pathname, `/${locale}`);

    return (
        <Modal
            onClose={onClose}
            size="md"
            title={t('modalTitle')}
        >
            <p className="mb-6 text-body-sm text-foreground">{t(reason === 'join' ? 'modalDescJoin' : 'modalDesc')}</p>

            <SignInForm callbackUrl={callbackUrl} />
        </Modal>
    );
}
