'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRightLeft, Flag, LogOut, MoreHorizontal, Settings, Share2 } from 'lucide-react';
import { clsx } from 'clsx';
import { leaveGroup } from '@/actions/group-actions';
import { Link } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { hasAdminRights, isOwner as checkIsOwner } from '@/lib/utils/permissions';
import type { GroupContext } from '@/lib/services/group.service';
import { useGroupContext } from '@/components/providers/GroupProvider';

type Props = {
    group: GroupContext;
    l1Slug: string;
    /** `overlay` sits on the banner (mobile breadcrumb row); `bar` sits in the action row. */
    variant: 'overlay' | 'bar';
    className?: string;
    onReport: () => void;
};

const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated';

/** The one "…" menu of the group page; the header renders it in a mobile and a desktop spot. */
export default function GroupMoreMenu({ group, l1Slug, variant, className, onReport }: Props) {
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { success, error: toastError } = useToast();
    const { user: { role, isMember } } = useGroupContext();
    const [isOpen, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    const isOwner = checkIsOwner(role);
    const canManage = hasAdminRights(role);

    useEffect(() => {
        if (!isOpen) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

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
        if (isPending || !confirm(c('confirmLeave'))) return;
        setOpen(false);
        startTransition(async () => {
            const res = await leaveGroup(group.id, locale);
            if (!res.success) toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <div className={clsx('relative', className)} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={c('moreOptions')}
                aria-expanded={isOpen}
                className={clsx(
                    'flex items-center justify-center transition-all active:scale-95',
                    variant === 'overlay'
                        ? 'h-7 w-7 rounded-xl border border-white/10 bg-black/20 text-white shadow-premium backdrop-blur-md'
                        : 'h-10 w-10 rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-elevated'
                )}
            >
                <MoreHorizontal className={variant === 'overlay' ? 'h-5 w-5' : 'h-4 w-4'} />
            </button>

            {isOpen && (
                <div
                    className={clsx(
                        'absolute right-0 z-[45] min-w-[220px] max-w-[calc(100vw-32px)] origin-top-right overflow-hidden rounded-xl border border-border bg-surface py-1 text-foreground shadow-2xl shadow-black/20',
                        variant === 'overlay' ? 'top-9' : 'top-12'
                    )}
                >
                    {canManage && (
                        <>
                            <Link
                                href={`/${l1Slug}/group/${group.slug}/settings`}
                                className={ITEM}
                                onClick={() => setOpen(false)}
                            >
                                <Settings className="h-4 w-4 text-foreground-muted" />
                                {c('groupSettings')}
                            </Link>
                            <div className="mx-2 my-1 h-px bg-border" />
                        </>
                    )}

                    <button type="button" onClick={handleShare} className={ITEM}>
                        <Share2 className="h-4 w-4 text-foreground-muted" />
                        {c('shareGroup')}
                    </button>

                    {isMember && !isOwner && (
                        <button type="button" onClick={handleLeave} disabled={isPending} className={clsx(ITEM, 'text-red-500')}>
                            <LogOut className="h-4 w-4" />
                            {c('leaveGroup')}
                        </button>
                    )}

                    {/* The owner cannot just leave: the group has to go to someone else first. */}
                    {isOwner && (
                        <Link
                            href={`/${l1Slug}/group/${group.slug}/settings?tab=group#transfer`}
                            className={ITEM}
                            onClick={() => setOpen(false)}
                        >
                            <ArrowRightLeft className="h-4 w-4 text-foreground-muted" />
                            {c('transferOwnership')}
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => { setOpen(false); onReport(); }}
                        className={clsx(ITEM, 'text-foreground-muted hover:text-red-500')}
                    >
                        <Flag className="h-4 w-4" />
                        {c('reportGroup')}
                    </button>
                </div>
            )}
        </div>
    );
}
