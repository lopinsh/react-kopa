import Image from 'next/image';
import Link from 'next/link';
import { Users, MapPin, Globe, Lock, Zap, Clock } from 'lucide-react';
import { getSmartImageUrl } from '@/lib/image-utils';
import { clsx } from 'clsx';
import type { GroupType } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface GroupMemberPreview {
    id: string;
    name: string | null;
    avatarSeed: string | null;
}

type Props = {
    group: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        city: string;
        type: GroupType;
        memberCount: number;
        bannerImage: string | null;
        members: GroupMemberPreview[];
        category: {
            title: string;
            l1Slug: string;
            parentTitle?: string;
            color: string;
        };
    };
    accentColor: string;
    priority?: boolean;
    locale: string;
};

const TYPE_ICONS = {
    PUBLIC: Globe,
    PRIVATE: Lock,
    SINGLE_EVENT: Zap,
};

function dicebearUrl(seed: string | null | undefined, fallbackId: string): string {
    const s = seed || fallbackId;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s)}`;
}

export default function GroupCard({ group, accentColor: globalAccentColor, priority, locale }: Props) {
    const t = useTranslations('discovery');
    const accentColor = group.category.color || globalAccentColor;
    const Icon = TYPE_ICONS[group.type];

    const categoryName = group.category.parentTitle ? group.category.title : group.category.title;

    // Pattern for image thumbnail fallback
    const patternStyle = {
        background: `radial-gradient(circle at top left, ${accentColor} 0%, transparent 70%),
                     radial-gradient(circle at bottom right, ${accentColor} 0%, transparent 70%)`,
        opacity: 0.15,
    };

    // Strip HTML from description for a clean preview
    const cleanDescription = group.description
        ? group.description.replace(/<[^>]*>/g, '').trim()
        : null;

    // Up to 5 member avatars and optional overflow count
    const visibleMembers = group.members.slice(0, 5);
    const overflowCount = group.memberCount > 5 ? group.memberCount - 5 : 0;

    return (
        <Link
            href={group.category.l1Slug ? `/${locale}/${group.category.l1Slug}/group/${group.slug}` : `/${locale}/groups/${group.slug}`}
            className="group relative flex flex-col h-full overflow-hidden rounded-[20px] bg-surface text-foreground 
                border-slate-200 border shadow-sm transition-transform duration-200 ease-out 
                hover:shadow-md hover:border-[var(--accent)] hover:scale-[1.02] soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            {/* Thumbnail Image Area (Top Strip) */}
            <div className="aspect-[4/3] w-full relative bg-surface-elevated overflow-hidden shrink-0 border-b border-border/50">
                {group.bannerImage ? (
                    <Image
                        src={getSmartImageUrl(group.bannerImage)}
                        alt={group.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={priority}
                    />
                ) : (
                    <div className="absolute inset-0" style={patternStyle} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Overlay Tags */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-black/40 backdrop-blur-md px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white border border-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex items-center gap-1.5 leading-none">
                        <MapPin className="h-3 w-3 text-white/90" />
                        <span className="drop-shadow-sm">{group.city}</span>
                    </span>
                    <span className="rounded-md bg-black/40 backdrop-blur-md px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white border border-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex items-center gap-1.5 leading-none">
                        <Icon className="h-3 w-3 text-white/90" />
                        <span className="drop-shadow-sm">{group.type === 'SINGLE_EVENT' ? t('eventType') : group.type}</span>
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col px-5 py-4 pb-5">
                {/* Header: Title */}
                <div className="mb-2 flex flex-col items-start justify-start gap-1">
                    <span
                        className="flex items-center gap-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-0.5"
                        style={{ color: accentColor }}
                    >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        {categoryName}
                    </span>
                    <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-[var(--accent)]">
                        {group.name}
                    </h3>
                </div>

                {/* Description - Exactly 2 lines tight leading */}
                <p className="line-clamp-2 text-[13px] leading-[1.4] text-slate-500 mb-6 flex-1 text-balance">
                    {cleanDescription || t('noDescription')}
                </p>

                {/* Footer Section */}
                <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-3">

                    {/* Real Member Avatars & Active Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Real DiceBear Avatar Stack */}
                            <div className="flex -space-x-1.5 overflow-hidden">
                                {visibleMembers.map((member) => (
                                    <Image
                                        key={member.id}
                                        src={dicebearUrl(member.avatarSeed ?? member.name, member.id)}
                                        alt={member.name ?? 'Member'}
                                        width={24}
                                        height={24}
                                        unoptimized
                                        className="inline-block h-6 w-6 rounded-full ring-2 ring-surface bg-slate-100"
                                    />
                                ))}
                                {overflowCount > 0 && (
                                    <span className={clsx(
                                        'inline-flex items-center justify-center h-6 min-w-[24px] px-1 rounded-full ring-2 ring-surface',
                                        'bg-slate-200 text-[9px] font-bold text-slate-600'
                                    )}>
                                        +{overflowCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                                {t('memberCount', { count: group.memberCount })}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{t('active')}</span>
                        </div>
                    </div>

                </div>
            </div>
        </Link>
    );
}
