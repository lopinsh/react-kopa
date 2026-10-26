'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, History, Pencil, Tags } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { setAdminPanel } from '@/actions/admin-panel-actions';
import { requestPanelFocus } from '@/components/admin-panel/panel-storage';
import { useAdminGroup } from '@/components/providers/AdminGroupContext';
import { useAdminPanelTab } from '@/components/providers/AdminPanelContext';
import { MenuGroup, MenuItemButton, MenuItemLink } from '@/components/ui/Menu';
import type { AdminPanelFocus } from '@/lib/constants';

const ICON = 'size-4 text-foreground-muted';

/** "Šī grupa": the current group's tools. Nothing here is destructive: hiding needs a reason typed in the Grupa tab. Renders on group pages only. */
export default function AdminMenuGroup({ onDone }: { onDone: () => void }) {
    const t = useTranslations('nav');
    const tMod = useTranslations('moderation');
    const tAdmin = useTranslations('adminTools');
    const group = useAdminGroup();
    const panelTab = useAdminPanelTab();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    if (!group) return null;

    const openTab = (focus: AdminPanelFocus) => {
        if (isPending) return;
        onDone();
        requestPanelFocus(focus);
        if (panelTab === 'group') return; // already open: the event alone moves focus
        startTransition(async () => {
            const res = await setAdminPanel('group');
            if (res.success) router.refresh();
        });
    };
    const label = t('thisGroup', { name: group.name });

    return (
        <MenuGroup label={label} title={label}>
            {group.canHide && <MenuItemButton disabled={isPending} onSelect={() => openTab('hideReason')} icon={<EyeOff aria-hidden className={ICON} />}>{tMod('hideGroup')}</MenuItemButton>}
            {group.hidden && <MenuItemButton disabled={isPending} onSelect={() => openTab('restore')} icon={<Eye aria-hidden className={ICON} />}>{tMod('restore')}</MenuItemButton>}
            <MenuItemLink href={`/admin/groups/${group.l1Slug}/${group.slug}/categorization`} icon={<Tags aria-hidden className={ICON} />}>{tAdmin('fixCategorization')}</MenuItemLink>
            <MenuItemLink href={`${group.href}/settings`} icon={<Pencil aria-hidden className={ICON} />}>{tAdmin('editGroup')}</MenuItemLink>
            <MenuItemButton disabled={isPending} onSelect={() => openTab('reports')} icon={<History aria-hidden className={ICON} />}>{t('groupReportsLog')}</MenuItemButton>
        </MenuGroup>
    );
}
