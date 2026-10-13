'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRightLeft, Flag, LogOut, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import { clsx } from 'clsx';
import { leaveGroup } from '@/actions/group-actions';
import { Link } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { isOwner as checkIsOwner } from '@/lib/utils/permissions';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useClickOutside } from '@/hooks/useClickOutside';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { groupChip } from './frame/chip';

type Props = {
    /** Gets the menu's trigger button so the report pop-up can hand focus back to it. */
    onReport: (trigger: HTMLElement | null) => void;
    /** Plain members write to the team from here (OD-10); same conversation as "Sazināties". */
    onWriteToTeam: (trigger: HTMLElement | null) => void;
};

const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated';

/** The one "…" menu of the group page, in the banner's action cluster; it reads the group from the context. */
export default function GroupMoreMenu({ onReport, onWriteToTeam }: Props) {
    const c = useTranslations('common');
    const tGroup = useTranslations('group');
    const tErrors = useTranslations('errors');
    const { success, error: toastError } = useToast();
    const group = useGroupContext();
    const { user: { role, isMember, isAdmin } } = group;
    const [isOpen, setOpen] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const isOwner = checkIsOwner(role);

    useClickOutside(ref, () => setOpen(false), isOpen);

    const handleShare = async () => {
        setOpen(false);
        const url = window.location.href;
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title: group.name, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            success(c('linkCopied'));
        } catch (err) {
            // Closing the native share sheet is not an error.
            if (err instanceof DOMException && err.name === 'AbortError') return;
            toastError(c('shareFailed'));
        }
    };

    const handleLeave = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await leaveGroup(group.id);
            setLeaveConfirmOpen(false);
            if (!res.success) toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <div className="relative flex" ref={ref}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={c('moreOptions')}
                aria-expanded={isOpen}
                className={clsx('grid size-10 place-items-center rounded-full transition-all active:scale-95', groupChip(group.image !== null))}
            >
                <MoreHorizontal aria-hidden className="size-5" />
            </button>

            {isOpen && (
                <div
                    data-ui="dropdown-menu"
                    className="absolute right-0 top-12 z-[45] min-w-[220px] max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-xl border border-border bg-surface py-1 text-foreground shadow-premium"
                >

                    <button type="button" onClick={handleShare} className={ITEM}>
                        <Share2 className="h-4 w-4 text-foreground-muted" />
                        {c('shareGroup')}
                    </button>

                    {isMember && !isAdmin && (
                        <button type="button" onClick={() => { setOpen(false); onWriteToTeam(triggerRef.current); }} className={ITEM}>
                            <MessageSquare className="h-4 w-4 text-foreground-muted" />
                            {tGroup('writeToTeam')}
                        </button>
                    )}

                    {isMember && !isOwner && (
                        <button type="button" onClick={() => { setOpen(false); setLeaveConfirmOpen(true); }} disabled={isPending} className={clsx(ITEM, 'text-danger')}>
                            <LogOut className="h-4 w-4" />
                            {c('leaveGroup')}
                        </button>
                    )}

                    {/* The owner cannot just leave: the group has to go to someone else first. */}
                    {isOwner && (
                        <Link
                            href={`${group.href}/settings?tab=owner#transfer`}
                            className={ITEM}
                            onClick={() => setOpen(false)}
                        >
                            <ArrowRightLeft className="h-4 w-4 text-foreground-muted" />
                            {c('transferOwnership')}
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => { setOpen(false); onReport(triggerRef.current); }}
                        className={clsx(ITEM, 'text-foreground-muted hover:text-danger')}
                    >
                        <Flag className="h-4 w-4" />
                        {c('reportGroup')}
                    </button>
                </div>
            )}

            <ConfirmPopover
                anchorRef={triggerRef}
                isOpen={leaveConfirmOpen}
                onOpenChange={setLeaveConfirmOpen}
                message={c('confirmLeave')}
                confirmLabel={c('leaveGroup')}
                destructive
                isPending={isPending}
                onConfirm={handleLeave}
            />
        </div>
    );
}
