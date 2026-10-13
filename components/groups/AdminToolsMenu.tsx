'use client';

import { useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EyeOff, Eye, History, Pencil, Tags, UserCog } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, useRouter } from '@/i18n/routing';
import { restoreGroup } from '@/actions/moderation-actions';
import { useToast } from '@/hooks/use-toast';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useClickOutside } from '@/hooks/useClickOutside';
import { groupChip } from './frame/chip';

type Props = {
    onHide: (trigger: HTMLElement | null) => void;
};

const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated';

/**
 * Site-admin tools for one group, kept apart from the "…" menu everybody sees.
 * Rendered only for site admins (User.role === 'ADMIN'); the actions behind it check the role again on the server.
 */
export default function AdminToolsMenu({ onHide }: Props) {
    const group = useGroupContext();
    const t = useTranslations('adminTools');
    const tMod = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { error: toastError } = useToast();
    const [isOpen, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useClickOutside(ref, () => setOpen(false), isOpen);

    if (!group.moderation.isSiteAdmin) return null;

    const isHidden = group.moderation.hidden;
    // A site admin who owns the group manages it as an owner, not by hiding it from themselves.
    const canHide = !isHidden && group.user.role !== 'OWNER';

    const handleRestore = () => {
        if (isPending) return;
        setOpen(false);
        startTransition(async () => {
            const res = await restoreGroup(group.id, locale);
            if (res.success) router.refresh();
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <div className="relative flex" ref={ref}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={t('label')}
                title={t('label')}
                aria-expanded={isOpen}
                className={clsx('grid size-10 place-items-center rounded-full transition-all active:scale-95', groupChip(group.image !== null))}
            >
                <UserCog aria-hidden className="size-5" />
            </button>

            {isOpen && (
                <div
                    data-ui="dropdown-menu"
                    className="absolute right-0 top-12 z-[45] min-w-[240px] max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-xl border border-border bg-surface py-1 text-foreground shadow-premium"
                >
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold text-foreground-muted">{t('label')}</p>

                    {canHide && (
                        <button
                            type="button"
                            onClick={() => { setOpen(false); onHide(triggerRef.current); }}
                            className={clsx(ITEM, 'text-danger')}
                        >
                            <EyeOff className="h-4 w-4" />
                            {tMod('hideGroup')}
                        </button>
                    )}
                    {isHidden && (
                        <button type="button" onClick={handleRestore} disabled={isPending} className={ITEM}>
                            <Eye className="h-4 w-4 text-foreground-muted" />
                            {tMod('restore')}
                        </button>
                    )}

                    <Link href={`/admin/groups/${group.category.l1Slug}/${group.slug}/categorization`} className={ITEM} onClick={() => setOpen(false)}>
                        <Tags className="h-4 w-4 text-foreground-muted" />
                        {t('fixCategorization')}
                    </Link>
                    <Link href={`${group.href}/settings`} className={ITEM} onClick={() => setOpen(false)}>
                        <Pencil className="h-4 w-4 text-foreground-muted" />
                        {t('editGroup')}
                    </Link>
                    <Link href={`/admin?tab=moderation&group=${group.id}`} className={ITEM} onClick={() => setOpen(false)}>
                        <History className="h-4 w-4 text-foreground-muted" />
                        {t('moderationLog')}
                    </Link>
                </div>
            )}
        </div>
    );
}
