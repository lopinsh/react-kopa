'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import TranslateModeToggle from '@/components/translate/TranslateModeToggle';
import FeedbackModeToggle from '@/components/feedback/FeedbackModeToggle';
import { MENU_ITEM_CLASS, MenuItemLink, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';
import { ICON_BUTTON } from './header-styles';

/** Header shield with the site admin's tools (AR-18). Render it for site admins only; the actions behind it check the role again. */
export default function AdminMenu() {
    const t = useTranslations('nav');
    const { open, close, rootRef, triggerProps, menuProps } = useMenu();

    return (
        <div className="relative shrink-0" ref={rootRef}>
            <button {...triggerProps} aria-label={t('adminMenu')} title={t('adminMenu')} className={clsx(ICON_BUTTON, open && 'bg-tint')}>
                <ShieldCheck aria-hidden />
            </button>
            {open && (
                <MenuPanel label={t('adminMenu')} dataUi={UI.shieldMenu} {...menuProps}>
                    <FeedbackModeToggle className={MENU_ITEM_CLASS} onToggle={close} />
                    <TranslateModeToggle className={MENU_ITEM_CLASS} onToggle={close} />
                    <MenuSeparator />
                    <MenuItemLink href="/admin" icon={<LayoutDashboard aria-hidden className="size-[17px] text-foreground-muted" />} trailing={<ArrowRight aria-hidden className="ml-auto size-4 text-foreground-muted" />}>
                        {t('adminPanel')}
                    </MenuItemLink>
                </MenuPanel>
            )}
        </div>
    );
}
