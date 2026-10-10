'use client';

import { useTranslations } from 'next-intl';
import { Shield, User as UserIcon, MessageSquare, ExternalLink, MoreVertical, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useRef, useState, useTransition } from 'react';
import { promoteMember, demoteMember, kickMember } from '@/actions/group-actions';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import { useToast } from '@/hooks/use-toast';
import { avatarUrl } from '@/lib/avatar';
import { hasAdminRights, isOwner as checkIsOwner } from '@/lib/utils/permissions';

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
    groupId: string;
    currentUserRole: string | null;
    locale: string;
    l1Slug: string;
};

export default function MemberCard({ member, groupId, currentUserRole, locale, l1Slug }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close the manage menu on outside click/tap or Escape.
    useEffect(() => {
        if (!menuOpen) return;
        const onPointer = (e: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const canMessage = member.user.allowDirectMessages;
    const canViewProfile = member.user.isProfilePublic;

    // Management permissions (matches GroupService logic)
    const isOwner = checkIsOwner(currentUserRole);
    const isAdmin = hasAdminRights(currentUserRole); // Note: hasAdminRights includes Owner, but here we likely want "is at least admin"
    const isTargetOwner = checkIsOwner(member.role);
    const isTargetAdmin = member.role === 'ADMIN'; // Explicit admin check for target
    const isTargetMember = member.role === 'MEMBER';

    // The owner promotes/demotes moderators and removes anyone but themselves.
    // Moderators remove regular members only (never the owner or another moderator). The service enforces the same.
    const canPromote = isOwner && isTargetMember;
    const canDemote = isOwner && isTargetAdmin;
    const canKick = (isOwner && !isTargetOwner) || (isAdmin && isTargetMember);

    const handleAction = (action: 'promote' | 'demote' | 'kick') => {
        setMenuOpen(false);
        if (!window.confirm(t(`confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return;

        startTransition(async () => {
            const result = action === 'promote'
                ? await promoteMember(groupId, member.user.id, locale)
                : action === 'demote'
                    ? await demoteMember(groupId, member.user.id, locale)
                    : await kickMember(groupId, member.user.id, locale);

            if (result.success) {
                success(c_common('manageSuccess'));
                router.refresh();
            } else {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    const handleMessage = () => {
        if (!canMessage || isPending) return;

        startTransition(async () => {
            const result = await getOrCreateDirectChat(member.user.id);
            if (result.success && result.data) {
                router.push(`/messages?c=${result.data.conversationId}`);
            } else {
                toastError(!result.success && result.error === 'DM_NOT_ALLOWED' ? tErrors('DM_NOT_ALLOWED') : t('messageFailed'));
            }
        });
    };

    return (
        <div
            className={clsx(
                "flex flex-col gap-4 p-5 rounded-3xl border border-border bg-surface shadow-card hover:border-[var(--accent)]/30 transition-all group relative",
                menuOpen && "z-20"
            )}
        >
            {/* Subtle background glow on hover (clipped here so the manage menu can overflow the card) */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[var(--accent)] opacity-0 blur-[40px] transition-opacity group-hover:opacity-[0.03]" />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    {member.user.username ? (
                        <Link
                            href={`/profile/${member.user.username}`}
                            className="block h-14 w-14 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border overflow-hidden shadow-inner shrink-0 hover:ring-2 hover:ring-[var(--accent)]/50 transition-all"
                        >
                            <img
                                src={avatarUrl(member.user)}
                                alt={member.user.name || ''}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </Link>
                    ) : (
                        <div className="h-14 w-14 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border overflow-hidden shadow-inner shrink-0 cursor-default">
                            <img
                                src={avatarUrl(member.user)}
                                alt={member.user.name || ''}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    )}
                    {hasAdminRights(member.role) && (
                        <div
                            className="absolute -top-2 -right-2 p-1.5 rounded-full border-2 border-surface shadow-premium bg-[color:var(--accent)]"
                            title={t(`role_${member.role.toLowerCase()}`)}
                        >
                            <Shield className="h-3 w-3 text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {member.user.username ? (
                        <Link
                            href={`/profile/${member.user.username}`}
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
                        checkIsOwner(member.role) ? "text-[var(--accent)]" : "text-foreground-muted"
                    )}>
                        {t(`role_${member.role.toLowerCase()}`)}
                    </p>
                </div>

                {/* Management Dropdown (Visible only to authorized users) */}
                {canKick && (
                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={t('memberActions')}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            disabled={isPending}
                            className="p-2 rounded-xl text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-all"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        <div
                            role="menu"
                            className={clsx(
                                'absolute right-0 top-full mt-1 w-48 rounded-2xl bg-surface border border-border shadow-premium transition-all z-10 p-1',
                                menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                            )}
                        >
                            {canPromote && (
                                <button
                                    onClick={() => handleAction('promote')}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-foreground hover:bg-surface-elevated transition-colors"
                                >
                                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                    {c_common('promote')}
                                </button>
                            )}
                            {canDemote && (
                                <button
                                    onClick={() => handleAction('demote')}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-foreground hover:bg-surface-elevated transition-colors"
                                >
                                    <ArrowDownCircle className="h-4 w-4 text-orange-500" />
                                    {c_common('demote')}
                                </button>
                            )}
                            <button
                                onClick={() => handleAction('kick')}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                {c_common('kick')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                {canMessage && member.user.username ? (
                    <button
                        onClick={handleMessage}
                        disabled={isPending}
                        className={clsx(
                            "flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-[10px] font-bold uppercase tracking-wider text-foreground transition-all",
                            isPending ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--accent)] hover:text-[var(--accent)] bg-surface-elevated"
                        )}
                    >
                        {isPending ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <MessageSquare className="h-3.5 w-3.5" />
                        )}
                        {t('sendMessage')}
                    </button>
                ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated/50 border border-dashed border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted cursor-not-allowed opacity-60">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {c_common('private')}
                    </div>
                )}

                {canViewProfile && member.user.username ? (
                    <Link
                        href={`/profile/${member.user.username}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated border border-border text-[10px] font-bold uppercase tracking-wider text-foreground hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {c_common('viewProfile')}
                    </Link>
                ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-surface-elevated/50 border border-dashed border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted cursor-not-allowed opacity-60">
                        <UserIcon className="h-3.5 w-3.5" />
                        {c_common('private')}
                    </div>
                )}
            </div>
        </div>
    );
}
