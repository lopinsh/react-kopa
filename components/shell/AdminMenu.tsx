'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import AdminPanelToggle from '@/components/admin-panel/AdminPanelToggle';
import { MENU_ITEM_CLASS, MenuItemLink, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';
import { useAdminGroup } from '@/components/providers/AdminGroupContext';
import AdminMenuGroup from './AdminMenuGroup';
import AdminMenuQueues from './AdminMenuQueues';
import { ICON_BUTTON } from './header-styles';

/** Header shield with the site admin's tools (AR-18). Render it for site admins only; the actions behind it check the role again. */
export default function AdminMenu({ initialOpen }: { initialOpen?: boolean }) {
    const t = useTranslations('nav');
    const inGroup = useAdminGroup() !== null;
    const { open, close, rootRef, triggerProps, menuProps } = useMenu(initialOpen);

    return (
        <div className="relative shrink-0" ref={rootRef}>
            <button {...triggerProps} data-admin-shield aria-label={t('adminMenu')} title={t('adminMenu')} className={clsx(ICON_BUTTON, open && 'bg-tint')}>
                <ShieldCheck aria-hidden />
            </button>
            {open && (
                <MenuPanel label={t('adminMenu')} dataUi={UI.shieldMenu} {...menuProps}>
                    <AdminPanelToggle className={MENU_ITEM_CLASS} onToggle={close} />
                    <MenuSeparator />
                    <MenuItemLink href="/admin" icon={<LayoutDashboard aria-hidden className="size-4 text-foreground-muted" />} trailing={<ArrowRight aria-hidden className="ml-auto size-4 text-foreground-muted" />}>
                        {t('adminPanel')}
                    </MenuItemLink>
                    <MenuSeparator />
                    <AdminMenuQueues />
                    {inGroup && (
                        <>
                            <MenuSeparator />
                            <AdminMenuGroup onDone={close} />
                        </>
                    )}
                </MenuPanel>
            )}
        </div>
    );
}
