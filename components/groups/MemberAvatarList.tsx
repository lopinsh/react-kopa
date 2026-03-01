'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, ChevronRight, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import MemberMoreModal from '../modals/MemberMoreModal';
import SupportMessageModal from '../modals/SupportMessageModal';

type Props = {
    members: {
        role: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
    }[];
    groupId: string;
    groupName: string;
    accentColor: string;
    isMember?: boolean;
};

export default function MemberAvatarList({ members, accentColor, groupId, groupName, isMember }: Props) {
    const t = useTranslations('group');
    const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    // Sorting Logic: OWNER > ADMIN > MEMBER
    const sortedMembers = [...members].sort((a, b) => {
        const order: Record<string, number> = { OWNER: 0, ADMIN: 1, MEMBER: 2, PENDING: 3 };
        return (order[a.role] ?? 99) - (order[b.role] ?? 99);
    });

    const MAX_VISIBLE = 8;
    const visibleMembers = sortedMembers.slice(0, MAX_VISIBLE);
    const hasMore = members.length > MAX_VISIBLE;

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-1.5">
                {visibleMembers.map(({ user, role }) => (
                    <div
                        key={user.id}
                        onClick={() => {
                            if (isMember && (role === 'OWNER' || role === 'ADMIN')) {
                                setIsSupportModalOpen(true);
                            }
                        }}
                        className={clsx(
                            "group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 transition-all hover:bg-white/[0.05] hover:shadow-sm relative overflow-hidden",
                            isMember && (role === 'OWNER' || role === 'ADMIN') && "cursor-pointer hover:border-[var(--accent)]/30"
                        )}
                        style={isMember && (role === 'OWNER' || role === 'ADMIN') ? { '--accent': accentColor } as any : undefined}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-9 w-9 overflow-hidden rounded-lg bg-surface-elevated border border-white/10 ring-2 ring-white/[0.01]">
                                {user.image ? (
                                    <img
                                        src={user.image || undefined}
                                        alt={user.name || 'User'}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-foreground-muted">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            {(role === 'OWNER' || role === 'ADMIN') && (
                                <div
                                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full border border-background shadow-xs scale-90"
                                    style={{ backgroundColor: role === 'OWNER' ? '#f59e0b' : accentColor }}
                                >
                                    <div className="bg-white/20 rounded-full p-0.5">
                                        <MessageSquare className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="truncate text-[13px] font-bold text-foreground">
                                {user.name || 'Anonymous'}
                            </span>
                            <span
                                className="text-[9px] font-black uppercase tracking-[0.05em] opacity-50"
                                style={{ color: role === 'OWNER' ? '#f59e0b' : accentColor }}
                            >
                                {t(`role_${role.toLowerCase()}`)}
                            </span>
                        </div>

                        {/* Hover Background Accent */}
                        {isMember && (role === 'OWNER' || role === 'ADMIN') && (
                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
                            </div>
                        )}
                    </div>
                ))}

                {hasMore && (
                    <button
                        onClick={() => setIsMoreModalOpen(true)}
                        className="group flex items-center gap-3 rounded-xl border border-dashed border-white/10 p-2 transition-all hover:bg-white/[0.05] active:scale-[0.98]"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] text-foreground-muted group-hover:bg-white/10 group-hover:text-foreground transition-all">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground-muted group-hover:text-foreground transition-colors">
                            +{members.length - MAX_VISIBLE} {t('moreMembers')}
                        </span>
                    </button>
                )}
            </div>

            <MemberMoreModal
                isOpen={isMoreModalOpen}
                onClose={() => setIsMoreModalOpen(false)}
                members={members}
                accentColor={accentColor}
                groupId={groupId}
                groupName={groupName}
                isMember={isMember}
            />

            <SupportMessageModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                groupId={groupId}
                groupName={groupName}
                accentColor={accentColor}
            />
        </>
    );
}
