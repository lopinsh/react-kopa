import Link from 'next/link';
import { Users, MapPin, Globe, Lock, Zap } from 'lucide-react';
import type { GroupType } from '@prisma/client';

type Props = {
    group: {
        id: string;
        slug: string;
        name: string;
        city: string;
        type: GroupType;
        memberCount: number;
        category: {
            title: string;
            l1Slug: string;
            parentTitle?: string;
            color: string;
        };
    };
    accentColor: string;
    locale: string;
};

const TYPE_ICONS = {
    PUBLIC: Globe,
    PRIVATE: Lock,
    SINGLE_EVENT: Zap,
};

export default function ListViewCard({ group, accentColor: globalAccentColor, locale }: Props) {
    const accentColor = group.category.color || globalAccentColor;
    const Icon = TYPE_ICONS[group.type];

    return (
        <Link
            href={`/${locale}/${group.category.l1Slug}/group/${group.slug}`}
            className="group relative flex h-14 items-center overflow-hidden rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-[var(--accent)] hover:shadow-md soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            {/* Color Indicator */}
            <div
                className="mr-4 h-3 w-3 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: accentColor }}
            />

            {/* Title & Category Line */}
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <h3 className="truncate text-base font-bold text-foreground group-hover:text-[var(--accent)]">
                    {group.name}
                </h3>
                {group.category.parentTitle && (
                    <span className="hidden shrink-0 rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted sm:inline-block">
                        {group.category.title}
                    </span>
                )}
            </div>

            {/* Metadata (Right aligned) */}
            <div className="ml-4 flex shrink-0 items-center justify-end gap-4 text-xs font-semibold text-foreground-muted">
                <div className="hidden items-center gap-1 sm:flex uppercase tracking-wide">
                    <MapPin className="h-3.5 w-3.5" />
                    {group.city}
                </div>
                <div className="hidden items-center gap-1 md:flex">
                    <Icon className="h-3.5 w-3.5" />
                    {group.type === 'SINGLE_EVENT' ? 'Event' : group.type}
                </div>
                <div className="flex items-center gap-1.5 min-w-[3.5rem] justify-end font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    {group.memberCount}
                </div>
            </div>
        </Link>
    );
}
