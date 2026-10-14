'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useAuthGate } from '@/lib/useAuthGate';
import Button from '@/components/ui/Button';
import { UI } from '@/lib/constants';

const ContactForm = dynamic(() => import('@/components/groups/contact/ContactForm'), { ssr: false });
const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/**
 * "Sazināties" from a panel (AR-45): the same form as on the group page. Signed out, the sign-in pop-up opens first; after signing in
 * the page reloads on the group's own page (or the event page), where the stored action opens the form once.
 */
export default function ContactButton({ groupId, groupName, allowJoin }: { groupId: string; groupName: string; allowJoin: boolean }) {
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const { gateAction, isModalOpen, closeModal } = useAuthGate();
    return (
        <>
            <Button data-ui={UI.joinButton} className="w-full" onClick={() => gateAction(() => setOpen(true), 'join_group')}>{t('contact')}</Button>
            {open && <ContactForm onClose={() => setOpen(false)} groupId={groupId} groupName={groupName} allowJoin={allowJoin} />}
            {isModalOpen && <AuthGateModal isOpen onClose={closeModal} />}
        </>
    );
}
