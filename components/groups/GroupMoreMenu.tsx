'use client';

import { useId, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Flag, LogOut, MessageCircle, MoreHorizontal, Share2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { cancelJoinRequest, leaveGroup } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { useShareLink } from '@/hooks/useShareLink';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { MenuItemButton, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';
import { groupChip } from './frame/chip';

type Props = {
    /** Gets the menu's trigger button so the report pop-up can hand focus back to it. */
    onReport: (trigger: HTMLElement | null) => void;
    /** Members write to the team from here (OD-10); same conversation as "Sazināties". */
    onWriteToTeam: (trigger: HTMLElement | null) => void;
    /** Opens the menu at once (the UI-elements page only). */
    initialOpen?: boolean;
};

const ICON = 'size-[17px] text-foreground-muted';

/**
 * The one "…" menu of the group page (AR-51), in the banner's action cluster: the viewer's role as a quiet first line, then what
 * they can do. Rows are hidden, never greyed. An undoable step (withdraw, leave) asks once in a pop-over at this button.
 */
export default function GroupMoreMenu({ onReport, onWriteToTeam, initialOpen }: Props) {
    const c = useTranslations('common');
    const t = useTranslations('group');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const share = useShareLink();
    const { success, error: toastError } = useToast();
    const g = useGroupContext();
    const { open, rootRef, triggerProps, menuProps } = useMenu(initialOpen);
    const roleId = useId();
    const [confirm, setConfirm] = useState<'withdraw' | 'leave' | null>(null);
    const [isPending, startTransition] = useTransition();

    const { role } = g.user;
    const isOwner = role === 'OWNER';
    const isTeam = isOwner || role === 'ADMIN';
    const canLeave = role === 'MEMBER' || role === 'ADMIN';
    const trigger = () => triggerProps.ref.current;

    const showError = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const withdraw = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await cancelJoinRequest(g.id);
            setConfirm(null);
            if (res.success) success(t('requestWithdrawn'));
            else showError(res.error);
        });
    };

    const leave = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await leaveGroup(g.id);
            setConfirm(null);
            if (!res.success) return showError(res.error);
            // The pages that need membership would redirect mid-render: go to Informācija first.
            success(t('leftGroup'));
            router.replace(g.href);
        });
    };

    return (
        <div className="relative flex" ref={rootRef}>
            <button
                {...triggerProps}
                aria-label={c('moreOptions')}
                data-ui={UI.groupMoreButton}
                className={clsx('grid size-10 place-items-center rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary active:scale-95', groupChip(g.image !== null))}
            >
                <MoreHorizontal aria-hidden className="size-5" />
            </button>

            {open && (
                <MenuPanel label={c('moreOptions')} placement="anchor" describedBy={role ? roleId : undefined} dataUi={UI.groupMoreMenu} {...menuProps}>
                    {role && <p id={roleId} role="none" className="px-2.5 pb-1.5 pt-1 text-xs text-foreground-muted">{t(`more.role.${role}`)}</p>}

                    {role === 'PENDING' && (
                        <>
                            <MenuItemButton icon={<X aria-hidden className={ICON} />} onSelect={() => setConfirm('withdraw')}>{t('withdrawRequest')}</MenuItemButton>
                            <MenuSeparator />
                        </>
                    )}
                    {role === 'MEMBER' && (
                        <MenuItemButton icon={<MessageCircle aria-hidden className={ICON} />} onSelect={() => onWriteToTeam(trigger())}>{t('writeToTeam')}</MenuItemButton>
                    )}
                    <MenuItemButton icon={<Share2 aria-hidden className={ICON} />} onSelect={() => void share({ title: g.name, url: `${window.location.origin}/${locale}${g.href}` })}>
                        {c('shareGroup')}
                    </MenuItemButton>
                    {!isTeam && (
                        <MenuItemButton icon={<Flag aria-hidden className={ICON} />} onSelect={() => onReport(trigger())}>{c('reportGroup')}</MenuItemButton>
                    )}
                    {canLeave && (
                        <>
                            <MenuSeparator />
                            <MenuItemButton icon={<LogOut aria-hidden className={ICON} />} onSelect={() => setConfirm('leave')}>{c('leaveGroup')}</MenuItemButton>
                        </>
                    )}
                </MenuPanel>
            )}

            <ConfirmPopover
                anchorRef={triggerProps.ref}
                isOpen={confirm !== null}
                onOpenChange={(o) => { if (!o) setConfirm(null); }}
                message={confirm === 'withdraw' ? t('confirmCancelRequest') : c('confirmLeave')}
                confirmLabel={confirm === 'withdraw' ? t('withdrawRequest') : c('leaveGroup')}
                destructive
                isPending={isPending}
                onConfirm={confirm === 'withdraw' ? withdraw : leave}
            />
        </div>
    );
}
