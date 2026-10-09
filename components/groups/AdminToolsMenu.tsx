'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EyeOff, Eye, History, Pencil, Tags, UserCog } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, useRouter } from '@/i18n/routing';
import { restoreGroup } from '@/actions/moderation-actions';
import { useToast } from '@/hooks/use-toast';
import type { GroupContext } from '@/lib/services/group.service';
import TranslateModeToggle from '@/components/translate/TranslateModeToggle';

type Props = {
    group: GroupContext;
    l1Slug: string;
    /** `overlay` sits on the banner (mobile breadcrumb row); `bar` sits in the action row. */
    variant: 'overlay' | 'bar';
    className?: string;
    onHide: () => void;
};

const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-elevated';

/**
 * Site-admin tools for one group, kept apart from the "…" menu everybody sees.
 * Rendered only for site admins (User.role === 'ADMIN'); the actions behind it check the role again on the server.
 */
export default function AdminToolsMenu({ group, l1Slug, variant, className, onHide }: Props) {
    const t = useTranslations('adminTools');
    const tMod = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { error: toastError } = useToast();
    const [isOpen, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    if (!group.moderation.isSiteAdmin) return null;

    const isHidden = !!group.moderation.hidden;
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
        <div className={clsx('relative', className)} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={t('label')}
                title={t('label')}
                aria-expanded={isOpen}
                className={clsx(
                    'flex items-center justify-center transition-all active:scale-95',
                    variant === 'overlay'
                        ? 'h-7 w-7 rounded-xl border border-white/10 bg-black/20 text-white shadow-premium backdrop-blur-md'
                        : 'h-10 w-10 rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-elevated'
                )}
            >
                <UserCog className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className={clsx(
                        'absolute right-0 z-[45] min-w-[240px] max-w-[calc(100vw-32px)] origin-top-right overflow-hidden rounded-xl border border-border bg-surface py-1 text-foreground shadow-2xl shadow-black/20',
                        variant === 'overlay' ? 'top-9' : 'top-12'
                    )}
                >
                    <p className="px-4 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted">{t('label')}</p>

                    {canHide && (
                        <button
                            type="button"
                            onClick={() => { setOpen(false); onHide(); }}
                            className={clsx(ITEM, 'text-red-500')}
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

                    <Link href={`/admin/groups/${group.slug}/categorization`} className={ITEM} onClick={() => setOpen(false)}>
                        <Tags className="h-4 w-4 text-foreground-muted" />
                        {t('fixCategorization')}
                    </Link>
                    <Link href={`/${l1Slug}/group/${group.slug}/settings`} className={ITEM} onClick={() => setOpen(false)}>
                        <Pencil className="h-4 w-4 text-foreground-muted" />
                        {t('editGroup')}
                    </Link>
                    <Link href={`/admin?tab=moderation&group=${group.id}`} className={ITEM} onClick={() => setOpen(false)}>
                        <History className="h-4 w-4 text-foreground-muted" />
                        {t('moderationLog')}
                    </Link>
                    <div className="my-1 h-px bg-border/40" />
                    <TranslateModeToggle className={ITEM} onToggle={() => setOpen(false)} />
                </div>
            )}
        </div>
    );
}
