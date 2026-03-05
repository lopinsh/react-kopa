import { Link } from '@/i18n/routing';
import { Users, MapPin, Shield, User, Clock } from 'lucide-react';
import type { GroupType, MembershipRole } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

type Props = {
    group: {
        id: string;
        slug: string;
        name: string;
        city: string;
        type: GroupType;
        memberCount: number;
        role: MembershipRole;
        category: {
            title: string;
            l1Slug: string;
            parentTitle?: string;
            color: string;
        };
        accentColor: string;
    };
    locale: string;
};

export default function MyGroupsListRow({ group, locale }: Props) {
    const t = useTranslations('group');
    const accentColor = group.category.color || group.accentColor;

    return (
        <Link
            href={`/${locale}/${group.category.l1Slug}/group/${group.slug}`}
            className="group relative flex h-auto min-h-[3.5rem] flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-surface px-4 py-3 sm:py-2 transition-all hover:border-[var(--accent)] hover:shadow-md soft-press"
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
                    <h3 className="truncate text-base font-bold text-foreground group-hover:text-[var(--accent)]">
                        {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                        <span className="shrink-0 rounded-md bg-surface-elevated px-2 py-0.5">
                            {group.category.title}
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                            <MapPin className="h-3 w-3" />
                            {group.city}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metadata (Right aligned) */}
            <div className="flex shrink-0 items-center justify-between sm:justify-end gap-4 text-xs font-semibold text-foreground-muted ml-6 sm:ml-4">
                <div className="flex items-center gap-1.5 min-w-[3.5rem] justify-end font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    {group.memberCount}
                </div>

                <div
                    className={clsx(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1",
                        group.role === 'OWNER' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        group.role === 'ADMIN' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        group.role === 'PENDING' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        group.role === 'MEMBER' && "bg-surface-elevated text-foreground"
                    )}
                >
                    {group.role === 'OWNER' && <Shield className="h-3.5 w-3.5" />}
                    {group.role === 'ADMIN' && <Shield className="h-3.5 w-3.5" />}
                    {group.role === 'MEMBER' && <User className="h-3.5 w-3.5 text-foreground-muted" />}
                    {group.role === 'PENDING' && <Clock className="h-3.5 w-3.5" />}

                    <span>
                        {group.role === 'OWNER' ? t('role_owner') :
                            group.role === 'ADMIN' ? t('role_admin') :
                                group.role === 'PENDING' ? t('role_pending') :
                                    t('role_member')}
                    </span>
                </div>
            </div>
        </Link>
    );
}
