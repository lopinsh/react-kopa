'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EyeOff, Eye, History, Pencil, Tags, UserCog } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { restoreGroup } from '@/actions/moderation-actions';
import { useToast } from '@/hooks/use-toast';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { MenuItemButton, MenuItemLink, MenuPanel, useMenu } from '@/components/ui/Menu';
import { groupChip } from './frame/chip';

type Props = {
    onHide: (trigger: HTMLElement | null) => void;
};

const ICON = 'size-[17px] text-foreground-muted';

/**
 * Site-admin tools for one group, kept apart from the "…" menu everybody sees (the same menu, anchored to its own chip).
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
    const { open, rootRef, triggerProps, menuProps } = useMenu();
    const [isPending, startTransition] = useTransition();

    if (!group.moderation.isSiteAdmin) return null;

    const isHidden = group.moderation.hidden;
    // A site admin who owns the group manages it as an owner, not by hiding it from themselves.
    const canHide = !isHidden && group.user.role !== 'OWNER';

    const handleRestore = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await restoreGroup(group.id, locale);
            if (res.success) router.refresh();
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <div className="relative flex" ref={rootRef}>
            <button
                {...triggerProps}
                aria-label={t('label')}
                title={t('label')}
                className={clsx('grid size-10 place-items-center rounded-pill outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary active:scale-95', groupChip())}
            >
                <UserCog aria-hidden className="size-5" />
            </button>

            {open && (
                <MenuPanel label={t('label')} placement="anchor" {...menuProps}>
                    <p role="none" className="px-3 pb-1.5 pt-1 text-meta text-foreground-muted">{t('label')}</p>

                    {canHide && (
                        <MenuItemButton icon={<EyeOff aria-hidden className={ICON} />} onSelect={() => onHide(triggerProps.ref.current)}>{tMod('hideGroup')}</MenuItemButton>
                    )}
                    {isHidden && (
                        <MenuItemButton icon={<Eye aria-hidden className={ICON} />} disabled={isPending} onSelect={handleRestore}>{tMod('restore')}</MenuItemButton>
                    )}
                    <MenuItemLink href={`/admin/groups/${group.category.l1Slug}/${group.slug}/categorization`} icon={<Tags aria-hidden className={ICON} />}>{t('fixCategorization')}</MenuItemLink>
                    <MenuItemLink href={`${group.href}/settings`} icon={<Pencil aria-hidden className={ICON} />}>{t('editGroup')}</MenuItemLink>
                    <MenuItemLink href={`/admin?tab=moderation&group=${group.id}`} icon={<History aria-hidden className={ICON} />}>{t('moderationLog')}</MenuItemLink>
                </MenuPanel>
            )}
        </div>
    );
}
