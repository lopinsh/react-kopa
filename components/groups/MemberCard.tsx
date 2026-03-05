'use client';

import { useTranslations } from 'next-intl';
import { Shield, User as UserIcon, MessageSquare, ExternalLink, MoreVertical, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, useRouter } from '@/i18n/routing';
import { useTransition, useState } from 'react';
import { promoteMember, demoteMember, kickMember } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';

export interface Member {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        username?: string | null;
        avatarSeed?: string;
        image: string | null;
        allowDirectMessages: boolean;
        isProfilePublic: boolean;
    };
}

type Props = {
    member: Member;
    accentColor: string;
    groupId: string;
    currentUserRole: string | null;
    locale: string;
    l1Slug: string;
};

export default function MemberCard({ member, accentColor, groupId, currentUserRole, locale, l1Slug }: Props) {
    const t = useTranslations('group');
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const canMessage = member.user.allowDirectMessages;
    const canViewProfile = member.user.isProfilePublic;

    // Management permissions (matches GroupService logic)
    const isOwner = currentUserRole === 'OWNER';
    const isAdmin = currentUserRole === 'ADMIN';
    const isTargetOwner = member.role === 'OWNER';
    const isTargetAdmin = member.role === 'ADMIN';
    const isTargetMember = member.role === 'MEMBER';

    // Owners can promote/demote and kick anyone except themselves (or rather, except other owners if we had multiple)
    // Admins can kick regular members
    const canPromote = isOwner && isTargetMember;
    const canDemote = isOwner && isTargetAdmin;
    const canKick = (isOwner && !isTargetOwner) || (isAdmin && isTargetMember);

    const handleAction = (action: 'promote' | 'demote' | 'kick') => {
        if (!window.confirm(t(`confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return;

        startTransition(async () => {
            let result;
            if (action === 'promote') result = await promoteMember(groupId, member.user.id, locale);
            else if (action === 'demote') result = await demoteMember(groupId, member.user.id, locale);
            else if (action === 'kick') result = await kickMember(groupId, member.user.id, locale);

            if (result?.success) {
                success(t('manageSuccess'));
                router.refresh();
            } else {
                toastError(t('ACTION_FAILED'));
            }
        });
    };

    return (
        <div
            className="flex flex-col gap-4 p-5 rounded-3xl border border-border bg-surface shadow-card hover:border-[var(--accent)]/30 transition-all group relative overflow-hidden"
            style={{ '--accent': accentColor } as React.CSSProperties}
        >
            {/* Subtle background glow on hover */}
            <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[var(--accent)] opacity-0 blur-[40px] transition-opacity group-hover:opacity-[0.03] pointer-events-none" />

            <div className="flex items-center gap-4">
                <div className="relative">
                    {member.user.username ? (
                        <Link
                            href={`/${l1Slug}/user/${member.user.username}`}
                            className="block h-14 w-14 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border overflow-hidden shadow-inner shrink-0 hover:ring-2 hover:ring-[var(--accent)]/50 transition-all"
                        >
                            {member.user.image ? (
                                <img
                                    src={member.user.image}
                                    alt={member.user.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : member.user.avatarSeed ? (
                                <img
                                    src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.user.avatarSeed}&radius=50&backgroundColor=transparent`}
                                    alt={member.user.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <UserIcon className="h-7 w-7 text-foreground-muted" />
                            )}
                        </Link>
                    ) : (
                        <div className="h-14 w-14 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border overflow-hidden shadow-inner shrink-0 cursor-default">
                            {member.user.image ? (
                                <img
                                    src={member.user.image}
                                    alt={member.user.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : member.user.avatarSeed ? (
                                <img
                                    src={`https://api.dicebear.com/9.x/micah/svg?seed=${member.user.avatarSeed}&radius=50&backgroundColor=transparent`}
                                    alt={member.user.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <UserIcon className="h-7 w-7 text-foreground-muted" />
                            )}
                        </div>
                    )}
                    {(member.role === 'OWNER' || member.role === 'ADMIN') && (
                        <div
                            className="absolute -top-2 -right-2 p-1.5 rounded-full border-2 border-surface shadow-premium"
                            style={{ backgroundColor: accentColor }}
                            title={t(`role_${member.role.toLowerCase()}`)}
                        >
                            <Shield className="h-3 w-3 text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {member.user.username ? (
                        <Link
                            href={`/${l1Slug}/user/${member.user.username}`}
                            className="font-bold text-foreground text-base tracking-tight truncate hover:text-[var(--accent)] transition-colors block"
                        >
                            {member.user.name || t('anonymousUser')}
                        </Link>
                    ) : (
                        <p className="font-bold text-foreground text-base tracking-tight truncate">
                            {member.user.name || t('anonymousUser')}
                        </p>
                    )}
                    <p className={clsx(
                        "text-[10px] font-black uppercase tracking-widest mt-0.5",
                        member.role === 'OWNER' ? "text-[var(--accent)]" : "text-foreground-muted"
                    )}>
                        {t(`role_${member.role.toLowerCase()}`)}
                    </p>
                </div>

                {/* Management Dropdown (Visible only to authorized users) */}
                {canKick && (
                    <div className="relative group/menu">
                        <button
                            disabled={isPending}
                            className="p-2 rounded-xl text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-all"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-surface border border-border shadow-premium opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 p-1">
                            {canPromote && (
                                <button
                                    onClick={() => handleAction('promote')}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-surface-elevated transition-colors"
                                >
                                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                    {t('promote')}
                                </button>
                            )}
                            {canDemote && (
                                <button
                                    onClick={() => handleAction('demote')}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-surface-elevated transition-colors"
                                >
                                    <ArrowDownCircle className="h-4 w-4 text-orange-500" />
                                    {t('demote')}
                                </button>
                            )}
                            <button
                                onClick={() => handleAction('kick')}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('kick')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                {canMessage && member.user.username ? (
                    <div
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated/50 border border-dashed border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted cursor-not-allowed opacity-60"
                        title="Direct Messaging coming soon"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t('sendMessage')}
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated/50 border border-dashed border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted cursor-not-allowed opacity-60">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t('private')}
                    </div>
                )}

                {canViewProfile && member.user.username ? (
                    <Link
                        href={`/${l1Slug}/user/${member.user.username}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated border border-border text-[10px] font-bold uppercase tracking-wider text-foreground hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('viewProfile')}
                    </Link>
                ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated/50 border border-dashed border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted cursor-not-allowed opacity-60">
                        <UserIcon className="h-3.5 w-3.5" />
                        {t('private')}
                    </div>
                )}
            </div>
        </div>
    );
}
