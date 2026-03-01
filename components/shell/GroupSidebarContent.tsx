'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { MessageSquare, Calendar, Users, Settings, Lock, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { getGroupRole } from '@/actions/group-actions';
import { useSearchParams } from 'next/navigation';
import { MembershipRole } from '@prisma/client';

type Props = {
    l1Slug: string;
    groupSlug: string;
    collapsed: boolean;
    hideHeader?: boolean;
};

export default function GroupSidebarContent({ l1Slug, groupSlug, collapsed, hideHeader = false }: Props) {
    const t = useTranslations('group');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const [state, setState] = useState<{
        role: MembershipRole | null,
        hasInstructions: boolean,
        pendingCount: number,
        sections: Array<{ id: string; title: string; visibility: string }>
    }>({
        role: null,
        hasInstructions: false,
        pendingCount: 0,
        sections: []
    });

    useEffect(() => {
        getGroupRole(l1Slug, groupSlug).then(setState);
    }, [l1Slug, groupSlug]);

    const baseUrl = `/${l1Slug}/group/${groupSlug}`;
    const isMember = state.role === 'OWNER' || state.role === 'ADMIN' || state.role === 'MEMBER';
    const isOwnerOrAdmin = state.role === 'OWNER' || state.role === 'ADMIN';

    const GROUP_NAV = [
        { id: 'info', icon: Info, label: t('informationTitle'), href: baseUrl, memberOnly: false },
        { id: 'events', icon: Calendar, label: t('eventsTitle'), href: `${baseUrl}/events`, memberOnly: false },
        { id: 'discussions', icon: MessageSquare, label: t('discussionTitle'), href: `${baseUrl}/discussions`, memberOnly: true },
        { id: 'members', icon: Users, label: t('membersTitle'), href: `${baseUrl}/members`, memberOnly: true },
    ];

    return (
        <div className="mt-6 flex flex-col gap-1 px-1">
            {!collapsed && !hideHeader && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-2 mb-1">
                    {t('groupMenu')}
                </div>
            )}

            {GROUP_NAV.map((item) => {
                const { id, icon: Icon, label, href, memberOnly } = item;
                const isLocked = memberOnly && !isMember;

                // Normalization for active state (same as GroupTabs)
                const normalizedPath = pathname.replace(`/${locale}`, '') || '/';
                const normalizedHref = (href as string).split('?')[0] || '/';

                // Use exact match for base URL to prevent "Information" being active on sub-pages
                const active = id === 'info'
                    ? normalizedPath === normalizedHref || normalizedPath === `${normalizedHref}/`
                    : normalizedPath.startsWith(normalizedHref) && !pathname.includes('/settings');

                if (isLocked) return null;

                return (
                    <Link
                        key={id}
                        href={href as any}
                        className={clsx(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left w-full soft-press relative',
                            active
                                ? 'bg-[var(--group-accent,var(--primary))] text-[var(--group-accent,var(--primary))] font-bold shadow-sm'
                                : 'text-foreground hover:bg-surface-elevated'
                        )}
                        style={active ? {
                            backgroundColor: 'color-mix(in srgb, var(--group-accent, var(--primary)) 12%, transparent)',
                            color: 'var(--group-accent, var(--primary))'
                        } : undefined}
                        title={collapsed ? label : undefined}
                    >
                        <div className="relative">
                            <Icon
                                className={clsx('h-5 w-5 shrink-0', !active && 'text-foreground-muted group-hover:text-foreground')}
                                style={active ? { color: 'var(--group-accent, var(--primary))' } : undefined}
                            />
                            {id === 'members' && state.pendingCount > 0 && isOwnerOrAdmin && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-surface animate-in zoom-in duration-300">
                                    {state.pendingCount}
                                </span>
                            )}
                        </div>
                        {!collapsed && <span className="truncate">{label}</span>}
                        {id === 'members' && state.pendingCount > 0 && isOwnerOrAdmin && collapsed && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-surface" />
                        )}
                    </Link>
                );
            })}

            {/* Administrative Access: Edit Group */}
            {isOwnerOrAdmin && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <Link
                        href={`${baseUrl}/settings` as any}
                        className={clsx(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all text-left w-full soft-press',
                            pathname.includes('/settings')
                                ? 'bg-[var(--group-accent,var(--primary))] text-[var(--group-accent,var(--primary))]'
                                : 'text-foreground hover:bg-surface-elevated'
                        )}
                        style={pathname.includes('/settings') ? {
                            backgroundColor: 'color-mix(in srgb, var(--group-accent, var(--primary)) 12%, transparent)',
                            color: 'var(--group-accent, var(--primary))'
                        } : undefined}
                        title={collapsed ? t('editGroup') : undefined}
                    >
                        <Settings
                            className={clsx('h-5 w-5 shrink-0', !pathname.includes('/settings') && 'text-foreground-muted group-hover:text-foreground')}
                            style={pathname.includes('/settings') ? { color: 'var(--group-accent, var(--primary))' } : undefined}
                        />
                        {!collapsed && <span className="truncate">{t('editGroup')}</span>}
                    </Link>
                </div>
            )}
        </div>
    );
}
