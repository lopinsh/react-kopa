'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Tags, AlertTriangle, EyeOff, Network, Languages, BookOpen, MessageSquareText, Palette, type LucideIcon } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

type Props = {
    pendingTags: number;
    pendingReports: number;
    pendingSuggestions: number;
};

type NavItem = {
    id: 'tags' | 'reports' | 'moderation' | 'taxonomy' | 'translations' | 'feedback' | 'design' | 'handbook';
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    badge: number;
    danger?: boolean;
};

/** The one navigation shared by every admin page. */
export default function AdminNav({ pendingTags, pendingReports, pendingSuggestions }: Props) {
    const t = useTranslations('admin.nav');
    const pathname = usePathname();
    const tab = useSearchParams().get('tab');

    const onDashboard = pathname === '/admin';

    const items: NavItem[] = [
        { id: 'tags', href: '/admin', label: t('tags'), icon: Tags, active: onDashboard && tab !== 'moderation', badge: pendingTags },
        { id: 'reports', href: '/admin/reports', label: t('reports'), icon: AlertTriangle, active: pathname.startsWith('/admin/reports'), badge: pendingReports, danger: true },
        { id: 'moderation', href: '/admin?tab=moderation', label: t('moderation'), icon: EyeOff, active: onDashboard && tab === 'moderation', badge: 0 },
        { id: 'taxonomy', href: '/admin/taxonomy', label: t('taxonomy'), icon: Network, active: pathname.startsWith('/admin/taxonomy'), badge: 0 },
        { id: 'translations', href: '/admin/translations', label: t('translations'), icon: Languages, active: pathname.startsWith('/admin/translations'), badge: pendingSuggestions },
        { id: 'feedback', href: '/admin/feedback', label: t('feedback'), icon: MessageSquareText, active: pathname.startsWith('/admin/feedback'), badge: 0 },
        { id: 'design', href: '/admin/design', label: t('design'), icon: Palette, active: pathname.startsWith('/admin/design'), badge: 0 },
        { id: 'handbook', href: '/admin/handbook', label: t('handbook'), icon: BookOpen, active: pathname.startsWith('/admin/handbook'), badge: 0 },
    ];

    return (
        <div className="container mx-auto max-w-6xl px-4 pt-6">
            <nav aria-label={t('label')} className="flex overflow-x-auto border-b border-border scrollbar-none">
                {items.map(({ id, href, label, icon: Icon, active, badge, danger }) => (
                    <Link
                        key={id}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={clsx(
                            'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:px-6',
                            active
                                ? danger ? 'border-red-500 text-red-500' : 'border-primary text-primary'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                        {badge > 0 && (
                            <span className={clsx('rounded-full px-2 py-0.5 text-xs', danger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary')}>
                                {badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
