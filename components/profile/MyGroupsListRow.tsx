import { Link } from '@/i18n/routing';
import { Users, MapPin } from 'lucide-react';
import type { GroupType, MembershipRole } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { cityLabel } from '@/lib/city-label';
import RoleTag from '@/components/ui/RoleTag';

type Props = {
    group: {
        id: string;
        slug: string;
        name: string;
        city: string;
        type: GroupType;
        memberCount: number;
        pendingCount?: number;
        role: MembershipRole;
        category: {
            title: string;
            l1Slug: string;
            parentTitle?: string | null;
            color: string;
        };
        accentColor: string;
    };
    locale: string;
    actionRequired?: boolean;
};

export default function MyGroupsListRow({ group, actionRequired }: Props) {
    const t = useTranslations('group');
    const tCities = useTranslations('cities');
    const accentColor = group.category.color || group.accentColor;

    // If action required is true, link directly to the requests tab
    const targetHref = actionRequired
        ? `/${group.category.l1Slug}/group/${group.slug}/members?tab=requests`
        : `/${group.category.l1Slug}/group/${group.slug}`;

    return (
        <Link
            href={targetHref}
            className="group relative flex h-auto min-h-[3.5rem] flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-surface px-4 py-3 sm:py-2 transition-all hover:border-primary hover:shadow-md soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Color Indicator */}
                <div
                    className="shrink-0 h-3 w-3 rounded-full shadow-sm"
                    style={{ backgroundColor: accentColor }}
                />

                {/* Title & Category Line */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 overflow-hidden flex-1">
                    <h3 className="truncate text-base font-bold text-foreground group-hover:text-primary">
                        {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground-muted">
                        <span className="shrink-0 rounded-md bg-surface-elevated px-2 py-0.5">
                            {group.category.title}
                        </span>
                        {group.city && (
                            <span className="flex items-center gap-0.5 shrink-0">
                                <MapPin className="h-3 w-3" />
                                {cityLabel(tCities, group.city)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Metadata (Right aligned) */}
            <div className="flex shrink-0 items-center justify-between sm:justify-end gap-4 text-xs font-semibold text-foreground-muted ml-6 sm:ml-4">
                {actionRequired && group.pendingCount && group.pendingCount > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-2.5 py-1 text-danger font-bold animate-in zoom-in">
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[11px] text-danger-foreground">
                            {group.pendingCount}
                        </span>
                        <span className="hidden sm:inline text-[11px]">{t('pendingRequests', { count: group.pendingCount }).replace(/[0-9]+/, '').trim()}</span>
                    </div>
                )}

                {!actionRequired && (
                    <div className="flex items-center gap-1.5 min-w-[3.5rem] justify-end font-bold text-foreground">
                        <Users className="h-3.5 w-3.5 text-foreground-muted" />
                        {group.memberCount}
                    </div>
                )}

                <RoleTag role={group.role} />
            </div>
        </Link>
    );
}
