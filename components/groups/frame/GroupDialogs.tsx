'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from '@/i18n/routing';
import { useAuthGate } from '@/lib/useAuthGate';
import { useGroupContext } from '@/components/providers/GroupProvider';

const ContactForm = dynamic(() => import('@/components/groups/contact/ContactForm'), { ssr: false });
const ReportModal = dynamic(() => import('@/components/modals/ReportModal'), { ssr: false });
const HideGroupModal = dynamic(() => import('@/components/modals/HideGroupModal'), { ssr: false });
const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

type Dialog = 'join' | 'team' | 'report' | 'hide' | null;

interface GroupDialogs {
    openContact: () => void;
    /** The trigger button of the row that opened a pop-up gets focus back when it closes. */
    openHide: (trigger: HTMLElement | null) => void;
    openReport: (trigger: HTMLElement | null) => void;
    openWriteToTeam: (trigger: HTMLElement | null) => void;
}

const noop = () => undefined;
const GroupDialogsContext = createContext<GroupDialogs>({ openContact: noop, openHide: noop, openReport: noop, openWriteToTeam: noop });

export const useGroupDialogs = () => useContext(GroupDialogsContext);

/**
 * Owns the group page's pop-ups (contact, write to the team, report, hide) and the sign-in resume (`join_group`, `report_group`) once, so the
 * banner's "Sazināties" and the rows in the left menu (desktop column and phone drawer) open the same ones.
 */
export function GroupDialogsProvider({ children }: { children: ReactNode }) {
    const g = useGroupContext();
    const pathname = usePathname();
    const [dialog, setDialog] = useState<Dialog>(null);
    const returnRef = useRef<HTMLElement | null>(null);
    const { gateAction, isModalOpen, closeModal, pendingAction, pendingUrl, isAuthenticated, clearPendingAction } = useAuthGate();

    const { role, isMember } = g.user;
    const isTeam = role === 'OWNER' || role === 'ADMIN';
    // Only the owner and site admins can see a hidden group, and writing to it fails: no "Sazināties" there.
    const canContact = !isMember && role !== 'PENDING' && !g.moderation.hidden;

    const openContact = useCallback(() => gateAction(() => setDialog('join'), 'join_group'), [gateAction]);

    // After signing in, the stored action continues once. The sign-in pop-up ends in a full page load, so the pop-up waits for that load. The stored URL keeps
    // the locale prefix, which next-intl's pathname drops.
    useEffect(() => {
        if (isModalOpen || !isAuthenticated || pendingUrl !== window.location.pathname) return;
        if (pendingAction !== 'join_group' && pendingAction !== 'report_group') return;
        clearPendingAction();
        if (pendingAction === 'join_group' && canContact) openContact();
        if (pendingAction === 'report_group' && !isTeam) {
            returnRef.current = null;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-time continuation after the sign-in reload
            setDialog('report');
        }
    }, [isModalOpen, isAuthenticated, pendingAction, pendingUrl, pathname, clearPendingAction, openContact, canContact, isTeam]);

    const value = useMemo<GroupDialogs>(() => ({
        openContact,
        openHide: (trigger) => { returnRef.current = trigger; setDialog('hide'); },
        openReport: (trigger) => { returnRef.current = trigger; gateAction(() => setDialog('report'), 'report_group'); },
        openWriteToTeam: (trigger) => { returnRef.current = trigger; setDialog('team'); },
    }), [openContact, gateAction]);
    const close = () => setDialog(null);

    return (
        <GroupDialogsContext.Provider value={value}>
            {children}
            {(dialog === 'join' || dialog === 'team') && (
                <ContactForm onClose={close} groupId={g.id} groupName={g.name} allowJoin={dialog === 'join' && g.isAcceptingMembers} returnFocusRef={dialog === 'team' ? returnRef : undefined} />
            )}
            {dialog === 'hide' && <HideGroupModal isOpen onClose={close} groupId={g.id} returnFocusRef={returnRef} />}
            {dialog === 'report' && <ReportModal onClose={close} targetGroupId={g.id} returnFocusRef={returnRef} />}
            {isModalOpen && <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />}
        </GroupDialogsContext.Provider>
    );
}
