'use client';

import { X, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import GroupSidebarContent from '../shell/GroupSidebarContent';

interface GroupInfoDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    group: any;
    l1Slug: string;
    groupSlug: string;
    accentColor: string;
}

export default function GroupInfoDrawer({
    isOpen,
    onClose,
    group,
    l1Slug,
    groupSlug,
    accentColor
}: GroupInfoDrawerProps) {
    const t = useTranslations('group');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 z-[44] bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onClose}
            />

            {/* Navigation Drawer */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 z-[45] w-full max-w-[280px] bg-surface shadow-premium transition-transform duration-300 ease-out md:hidden border-r border-border/50",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header - Consistent with Desktop Sidebar */}
                    <div className="flex h-16 items-center justify-between border-b border-border/50 px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                                style={{ color: accentColor, backgroundColor: `${accentColor}15` } as any}
                            >
                                <Menu className="h-5 w-5" />
                            </div>
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                                {t('groupMenu')}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2.5 text-foreground hover:bg-white/5 transition-all active:scale-95"
                            aria-label={t('closeDrawer')}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Navigation - Identical to Desktop Sidebar */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <GroupSidebarContent
                            l1Slug={l1Slug}
                            groupSlug={groupSlug}
                            collapsed={false}
                            hideHeader={true} // New prop to hide internal title
                        />
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border/50 p-4 bg-background/20">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-surface-elevated py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground shadow-card hover:bg-white/5 transition-all active:scale-[0.98] border border-border/50"
                        >
                            {t('closeDrawer')}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
