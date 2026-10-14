'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { useAuthGate } from '@/lib/useAuthGate';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import AdminToolsMenu from '@/components/groups/AdminToolsMenu';
import GroupMoreMenu from '@/components/groups/GroupMoreMenu';
import PendingState from '@/components/groups/contact/PendingState';

const ContactForm = dynamic(() => import('@/components/groups/contact/ContactForm'), { ssr: false });
const ReportModal = dynamic(() => import('@/components/modals/ReportModal'), { ssr: false });
const HideGroupModal = dynamic(() => import('@/components/modals/HideGroupModal'), { ssr: false });
const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

type Dialog = 'join' | 'team' | 'report' | 'hide' | null;

/**
 * The banner's right end, once for both widths: "Sazināties" for visitors (round on phones, AP-08), the pending state while a
 * request waits, nothing for members and the team, then the site-admin tools and the "…" menu. It also owns the pop-ups those
 * open, so the sign-in resume (`join_group`, `report_group`) runs once.
 */
export default function GroupActions() {
    const g = useGroupContext();
    const c = useTranslations('common');
    const pathname = usePathname();
    const [dialog, setDialog] = useState<Dialog>(null);
    // The menu button that opened a pop-up.
    const menuReturnRef = useRef<HTMLElement | null>(null);
    const { gateAction, isModalOpen, closeModal, pendingAction, pendingUrl, isAuthenticated, clearPendingAction } = useAuthGate();

    const { role, isMember } = g.user;
    const isVisitor = !isMember && role !== 'PENDING';
    const isTeam = role === 'OWNER' || role === 'ADMIN';
    // Only the owner and site admins can see a hidden group, and writing to it fails: no "Sazināties" there.
    const canContact = isVisitor && !g.moderation.hidden;

    const openContact = useCallback(() => gateAction(() => setDialog('join'), 'join_group'), [gateAction]);

    // After signing in, the stored action continues once: the contact form or the report. The sign-in pop-up ends in a full page load,
    // so the pop-up waits for that load (the sign-in pop-up is closed then) instead of opening under it and being lost. The stored URL keeps
    // the locale prefix, which next-intl's pathname drops.
    useEffect(() => {
        if (isModalOpen || !isAuthenticated || pendingUrl !== window.location.pathname) return;
        if (pendingAction !== 'join_group' && pendingAction !== 'report_group') return;
        clearPendingAction();
        if (pendingAction === 'join_group' && canContact) openContact();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-time continuation after the sign-in reload
        if (pendingAction === 'report_group' && !isTeam) setDialog('report');
    }, [isModalOpen, isAuthenticated, pendingAction, pendingUrl, pathname, clearPendingAction, openContact, canContact, isTeam]);

    // Menu items close their menu, so the pop-ups they open return focus to the menu's button.
    const onHide = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; setDialog('hide'); };
    const onReport = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; gateAction(() => setDialog('report'), 'report_group'); };
    const onWriteToTeam = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; setDialog('team'); };
    const close = () => setDialog(null);

    return (
        <div className="flex shrink-0 items-center gap-2">
            {canContact && (
                <button
                    type="button"
                    data-ui={UI.joinButton}
                    onClick={openContact}
                    className="order-last grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 md:order-first md:inline-flex md:w-auto md:gap-1.5 md:px-5"
                >
                    <MessageCircle aria-hidden className="size-5 md:hidden" />
                    <span className="sr-only md:not-sr-only">{c('contact')}</span>
                </button>
            )}
            {role === 'PENDING' && <PendingState />}
            <AdminToolsMenu onHide={onHide} />
            <GroupMoreMenu onReport={onReport} onWriteToTeam={onWriteToTeam} />

            {(dialog === 'join' || dialog === 'team') && (
                <ContactForm onClose={close} groupId={g.id} groupName={g.name} allowJoin={dialog === 'join' && g.isAcceptingMembers} returnFocusRef={dialog === 'team' ? menuReturnRef : undefined} />
            )}
            {dialog === 'hide' && <HideGroupModal isOpen onClose={close} groupId={g.id} returnFocusRef={menuReturnRef} />}
            {dialog === 'report' && <ReportModal onClose={close} targetGroupId={g.id} returnFocusRef={menuReturnRef} />}
            {isModalOpen && <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />}
        </div>
    );
}
