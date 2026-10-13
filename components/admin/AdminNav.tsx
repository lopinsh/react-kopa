'use client';

import { useRef, useState, useId, useEffect, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { AlertTriangle, Brush, ListChecks, EyeOff, Network, MapPin, Languages, BookOpen, MessageSquareText, Palette, UserCog, ChevronDown, type LucideIcon } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { useClickOutside } from '@/hooks/useClickOutside';
import { UI } from '@/lib/constants';

type Props = {
    pendingTags: number;
    pendingCities: number;
    pendingReports: number;
    pendingSuggestions: number;
};

type ItemId = 'redesign' | 'buildPlan' | 'reports' | 'decisions' | 'categories' | 'locations' | 'translations' | 'feedback' | 'design' | 'handbook' | 'team';
type GroupId = 'moderation' | 'structure' | 'site' | 'team' | 'development';

type NavItem = {
    id: ItemId;
    href: string;
    icon: LucideIcon;
    active: boolean;
    badge: number;
    danger?: boolean;
};

type NavGroup = { id: GroupId; items: NavItem[] };

const PHONE = 'phone';

function Badge({ count, danger }: { count: number; danger?: boolean }) {
    if (count <= 0) return null;
    return (
        <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', danger ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary')}>
            {count}
        </span>
    );
}

/** The one navigation shared by every admin page: four grouped menus (one phone menu below 640 px). */
export default function AdminNav({ pendingTags, pendingCities, pendingReports, pendingSuggestions }: Props) {
    const t = useTranslations('admin.nav');
    const pathname = usePathname();
    const tab = useSearchParams().get('tab');
    const baseId = useId();
    const rootRef = useRef<HTMLDivElement>(null);

    // A menu stays open only for the page it was opened on, so any navigation closes it.
    const navKey = `${pathname}?${tab ?? ''}`;
    const [openState, setOpenState] = useState<{ id: string; key: string } | null>(null);
    const open = openState && openState.key === navKey ? openState.id : null;
    const setOpen = (id: string | null) => setOpenState(id ? { id, key: navKey } : null);

    // On a mouse (hover-capable) desktop a group opens on hover and closes shortly after the pointer leaves.
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
    useEffect(() => cancelClose, []);
    const hoverCapable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onGroupEnter = (e: PointerEvent, id: string) => {
        if (e.pointerType !== 'mouse' || !hoverCapable()) return;
        cancelClose();
        setOpen(id);
    };
    const onGroupLeave = (e: PointerEvent, id: string) => {
        if (e.pointerType !== 'mouse' || !hoverCapable()) return;
        cancelClose();
        closeTimer.current = setTimeout(() => setOpenState((cur) => (cur && cur.id === id ? null : cur)), 200);
    };

    useClickOutside(rootRef, () => setOpenState(null), !!open);

    const onDashboard = pathname === '/admin';

    const groups: NavGroup[] = [
        {
            id: 'moderation',
            items: [
                { id: 'reports', href: '/admin/reports', icon: AlertTriangle, active: pathname.startsWith('/admin/reports'), badge: pendingReports, danger: true },
                { id: 'decisions', href: '/admin', icon: EyeOff, active: onDashboard, badge: 0 },
            ],
        },
        {
            id: 'structure',
            items: [
                { id: 'categories', href: '/admin/categories', icon: Network, active: pathname.startsWith('/admin/categories'), badge: pendingTags },
                { id: 'locations', href: '/admin/locations', icon: MapPin, active: pathname.startsWith('/admin/locations'), badge: pendingCities },
            ],
        },
        {
            id: 'site',
            items: [
                { id: 'translations', href: '/admin/translations', icon: Languages, active: pathname.startsWith('/admin/translations'), badge: pendingSuggestions },
                { id: 'design', href: '/admin/design', icon: Palette, active: pathname.startsWith('/admin/design'), badge: 0 },
                { id: 'handbook', href: '/admin/handbook', icon: BookOpen, active: pathname.startsWith('/admin/handbook'), badge: 0 },
            ],
        },
        {
            id: 'team',
            items: [
                { id: 'team', href: '/admin/team', icon: UserCog, active: pathname.startsWith('/admin/team'), badge: 0 },
            ],
        },
        {
            id: 'development',
            items: [
                { id: 'redesign', href: '/admin/development/redesign', icon: Brush, active: pathname.startsWith('/admin/development/redesign'), badge: 0 },
                { id: 'buildPlan', href: '/admin/development/build-plan', icon: ListChecks, active: pathname.startsWith('/admin/development/build-plan'), badge: 0 },
                { id: 'feedback', href: '/admin/feedback', icon: MessageSquareText, active: pathname.startsWith('/admin/feedback'), badge: 0 },
            ],
        },
    ];

    const currentItem = groups.flatMap((g) => g.items).find((i) => i.active);

    function focusItem(panel: HTMLElement | null, index: number) {
        const links = panel?.querySelectorAll<HTMLElement>('[role="menuitem"]');
        if (!links || links.length === 0) return;
        const i = (index + links.length) % links.length;
        links[i].focus();
    }

    function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string, panelId: string) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const existing = document.getElementById(panelId);
            if (existing) { focusItem(existing, 0); return; }
            setOpen(id);
            // The panel mounts after this event, so wait for it before moving focus.
            requestAnimationFrame(() => focusItem(document.getElementById(panelId), 0));
        }
    }

    function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>, buttonId: string) {
        const panel = event.currentTarget;
        const links = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        const index = links.indexOf(document.activeElement as HTMLElement);
        if (event.key === 'ArrowDown') { event.preventDefault(); focusItem(panel, index + 1); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem(panel, index - 1); }
        else if (event.key === 'Home') { event.preventDefault(); focusItem(panel, 0); }
        else if (event.key === 'End') { event.preventDefault(); focusItem(panel, links.length - 1); }
        else if (event.key === 'Escape') {
            event.stopPropagation();
            setOpen(null);
            document.getElementById(buttonId)?.focus();
        }
    }

    function onRootKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        // Escape on a menu button (focus not inside a panel) closes too.
        if (event.key === 'Escape' && open) setOpen(null);
    }

    function renderItem(item: NavItem) {
        const Icon = item.icon;
        return (
            <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                data-ui={UI.menuItem}
                aria-current={item.active ? 'page' : undefined}
                onClick={() => setOpen(null)}
                className={clsx(
                    'flex items-start gap-3 rounded-xl px-3 py-2 transition-colors',
                    item.active ? 'bg-primary/10' : 'hover:bg-surface-elevated'
                )}
            >
                <Icon className={clsx('mt-0.5 h-4 w-4 shrink-0', item.active ? (item.danger ? 'text-danger' : 'text-primary') : 'text-foreground-muted')} />
                <span className="min-w-0 flex-1">
                    <span className={clsx('block text-sm font-bold', item.active ? (item.danger ? 'text-danger' : 'text-primary') : 'text-foreground')}>
                        {t(item.id)}
                    </span>
                    <span className="block text-xs text-foreground-muted">{t(`desc.${item.id}`)}</span>
                </span>
                <Badge count={item.badge} danger={item.danger} />
            </Link>
        );
    }

    const phoneButtonId = `${baseId}-phone`;
    const phonePanelId = `${baseId}-phone-panel`;
    const phoneBadge = groups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.badge, 0), 0);

    return (
        <div className="container mx-auto max-w-6xl px-4 pt-6">
            <nav aria-label={t('label')} className="border-b border-border" onKeyDown={onRootKeyDown}>
                <div ref={rootRef}>
                    {/* Phone: one button, groups as headings. */}
                    <div className="relative sm:hidden">
                        <button
                            id={phoneButtonId}
                            type="button"
                            aria-expanded={open === PHONE}
                            aria-haspopup="menu"
                            aria-controls={open === PHONE ? phonePanelId : undefined}
                            onClick={() => setOpen(open === PHONE ? null : PHONE)}
                            onKeyDown={(e) => onButtonKeyDown(e, PHONE, phonePanelId)}
                            className="flex w-full items-center gap-2 border-b-2 border-primary px-2 py-3 text-sm font-semibold text-primary"
                        >
                            <span className="text-foreground-muted">{t('menu')}</span>
                            <span className="min-w-0 flex-1 truncate text-left">{currentItem ? t(currentItem.id) : ''}</span>
                            <Badge count={phoneBadge} />
                            <ChevronDown className={clsx('h-4 w-4 shrink-0 transition-transform', open === PHONE && 'rotate-180')} />
                        </button>
                        {open === PHONE && (
                            <div
                                id={phonePanelId}
                                role="menu"
                                aria-labelledby={phoneButtonId}
                                data-ui={UI.dropdownMenu}
                                onKeyDown={(e) => onPanelKeyDown(e, phoneButtonId)}
                                className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                            >
                                {groups.map((group) => (
                                    <div key={group.id} role="group" aria-label={t(`groups.${group.id}`)} className="py-1">
                                        <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-foreground-muted">{t(`groups.${group.id}`)}</p>
                                        {group.items.map(renderItem)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tablet and desktop: four group buttons, each with its own panel. */}
                    <div className="hidden sm:flex">
                        {groups.map((group, index) => {
                            const buttonId = `${baseId}-${group.id}`;
                            const panelId = `${buttonId}-panel`;
                            const isOpen = open === group.id;
                            const groupActive = group.items.some((i) => i.active);
                            const groupBadge = group.items.reduce((s, i) => s + i.badge, 0);
                            const dangerBadge = group.items.some((i) => i.danger && i.badge > 0);
                            return (
                                <div key={group.id} className="relative" onPointerEnter={(e) => onGroupEnter(e, group.id)} onPointerLeave={(e) => onGroupLeave(e, group.id)}>
                                    <button
                                        id={buttonId}
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-haspopup="menu"
                                        aria-controls={isOpen ? panelId : undefined}
                                        // A mouse click while hover already opened the menu keeps it open; taps and keys toggle.
                                        onClick={(e) => setOpen(isOpen && !(e.detail > 0 && hoverCapable()) ? null : group.id)}
                                        onKeyDown={(e) => onButtonKeyDown(e, group.id, panelId)}
                                        className={clsx(
                                            'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors lg:px-6',
                                            groupActive ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'
                                        )}
                                    >
                                        {t(`groups.${group.id}`)}
                                        <Badge count={groupBadge} danger={dangerBadge} />
                                        <ChevronDown className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                                    </button>
                                    {isOpen && (
                                        <div
                                            id={panelId}
                                            role="menu"
                                            aria-labelledby={buttonId}
                                            data-ui={UI.dropdownMenu}
                                            onKeyDown={(e) => onPanelKeyDown(e, buttonId)}
                                            className={clsx(
                                                'absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100',
                                                index >= 2 ? 'right-0' : 'left-0'
                                            )}
                                        >
                                            {group.items.map(renderItem)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
}
