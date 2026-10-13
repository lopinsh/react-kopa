'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Check, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { cancelJoinRequest } from '@/actions/group-actions';
import { usePathname } from '@/i18n/routing';
import { useAuthGate } from '@/lib/useAuthGate';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import AdminToolsMenu from '@/components/groups/AdminToolsMenu';
import GroupMoreMenu from '@/components/groups/GroupMoreMenu';
import { groupChip } from './chip';

const ContactGroupModal = dynamic(() => import('@/components/modals/ContactGroupModal'), { ssr: false });
const ReportModal = dynamic(() => import('@/components/modals/ReportModal'), { ssr: false });
const HideGroupModal = dynamic(() => import('@/components/modals/HideGroupModal'), { ssr: false });
const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

type Dialog = 'join' | 'team' | 'report' | 'hide' | null;

/**
 * The banner's right end, once for both widths: "Sazināties" for visitors (round on phones, AP-08), "✓ Pieprasīts" with the
 * withdraw pop-over while a request waits, nothing for members and the team, then the site-admin tools and the "…" menu.
 * It also owns the pop-ups those open, so the sign-in resume (`join_group`) runs once.
 */
export default function GroupActions() {
    const g = useGroupContext();
    const t = useTranslations('group');
    const c = useTranslations('common');
    const locale = useLocale();
    const pathname = usePathname();
    const [dialog, setDialog] = useState<Dialog>(null);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    // The menu button that opened a pop-up.
    const menuReturnRef = useRef<HTMLElement | null>(null);
    const { gateAction, isModalOpen, closeModal, pendingAction, pendingUrl, isAuthenticated, clearPendingAction } = useAuthGate();

    const { role, isMember } = g.user;
    const isRequested = role === 'PENDING';
    const isVisitor = !isMember && !isRequested;
    const onImage = g.image !== null;

    const openContact = useCallback(() => gateAction(() => setDialog('join'), 'join_group'), [gateAction]);

    // After signing in, the contact form opens once. The stored URL keeps the locale prefix, which next-intl's pathname drops.
    useEffect(() => {
        if (isAuthenticated && pendingAction === 'join_group' && pendingUrl === window.location.pathname) {
            clearPendingAction();
            if (isVisitor) openContact();
        }
    }, [isAuthenticated, pendingAction, pendingUrl, pathname, clearPendingAction, openContact, isVisitor]);

    const withdraw = () => {
        setCancelOpen(false);
        startTransition(async () => { await cancelJoinRequest(g.id, locale); });
    };
    // Menu items close their menu, so the pop-ups they open return focus to the menu's button.
    const onHide = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; setDialog('hide'); };
    const onReport = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; gateAction(() => setDialog('report')); };
    const onWriteToTeam = (trigger: HTMLElement | null) => { menuReturnRef.current = trigger; setDialog('team'); };
    const close = () => setDialog(null);
    const round = 'grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold md:inline-flex md:w-auto md:gap-1.5';

    return (
        <div className="flex shrink-0 items-center gap-2">
            {isVisitor && (
                <button
                    type="button"
                    data-ui={UI.joinButton}
                    onClick={openContact}
                    className={clsx(round, 'order-last bg-primary text-primary-foreground hover:opacity-90 md:order-first md:px-5')}
                >
                    <MessageCircle aria-hidden className="size-5 md:hidden" />
                    <span className="sr-only md:not-sr-only">{c('contact')}</span>
                </button>
            )}
            {isRequested && (
                <ConfirmPopover
                    isOpen={cancelOpen}
                    onOpenChange={setCancelOpen}
                    message={t('confirmCancelRequest')}
                    confirmLabel={t('withdrawRequest')}
                    destructive
                    isPending={isPending}
                    onConfirm={withdraw}
                    renderTrigger={(trigger) => (
                        <button {...trigger} type="button" disabled={isPending} className={clsx(round, 'order-last disabled:opacity-60 md:order-first md:px-4', groupChip(onImage))}>
                            <Check aria-hidden className="size-5 md:size-4" />
                            <span className="sr-only md:not-sr-only">{c('requested')}</span>
                        </button>
                    )}
                />
            )}
            <AdminToolsMenu onHide={onHide} />
            <GroupMoreMenu onReport={onReport} onWriteToTeam={onWriteToTeam} />

            {(dialog === 'join' || dialog === 'team') && (
                <ContactGroupModal isOpen onClose={close} groupId={g.id} groupName={g.name} locale={locale} allowJoin={dialog === 'join' && g.isAcceptingMembers} />
            )}
            {dialog === 'hide' && <HideGroupModal isOpen onClose={close} groupId={g.id} returnFocusRef={menuReturnRef} />}
            {dialog === 'report' && <ReportModal isOpen onClose={close} targetGroupId={g.id} returnFocusRef={menuReturnRef} />}
            {isModalOpen && <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />}
        </div>
    );
}
