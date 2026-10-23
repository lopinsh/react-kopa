'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthGate } from '@/lib/useAuthGate';

const ContactForm = dynamic(() => import('@/components/groups/contact/ContactForm'), { ssr: false });
const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/**
 * "Sazināties" on a group card (R21-G): a round 32 px icon button with a dashed outline in the Tēma colour (needs `--c` on the card). On the card's hover or
 * keyboard focus it widens to icon and word and fills with the Tēma colour; touch devices keep the circle. Opens the same form as the group page; signed out, the sign-in pop-up first.
 */
export default function CardContact({ groupId, groupName, allowJoin }: { groupId: string; groupName: string; allowJoin: boolean }) {
    const t = useTranslations('common');
    const [open, setOpen] = useState(false);
    const { gateAction, isModalOpen, closeModal } = useAuthGate();
    return (
        <>
            {/* ui-allow: the card's round icon button that widens into a pill on hover */}
            <button
                type="button"
                aria-label={t('contact')}
                onClick={() => gateAction(() => setOpen(true), 'join_group')}
                className="relative z-[2] ml-auto inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-pill px-2 text-button-sm text-[color-mix(in_srgb,var(--c)_82%,var(--foreground))] outline-dashed outline-[1.5px] -outline-offset-[1.5px] outline-[color-mix(in_srgb,var(--c)_70%,transparent)] transition-[background-color,color,padding] duration-base ease-standard motion-reduce:transition-none live:bg-[var(--c)] live:px-4 live:text-[var(--on-cat)] live:outline-transparent"
            >
                <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
                <span className="max-w-0 overflow-hidden transition-[max-width,margin] duration-base ease-standard motion-reduce:transition-none live:ml-1.5 live:max-w-32">{t('contact')}</span>
            </button>
            {open && <ContactForm onClose={() => setOpen(false)} groupId={groupId} groupName={groupName} allowJoin={allowJoin} />}
            {isModalOpen && <AuthGateModal isOpen onClose={closeModal} />}
        </>
    );
}
