'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
    MapPin, Users, Calendar, Settings, LogOut, UserPlus,
    ShieldAlert, Plus, ChevronRight, MoreHorizontal, HelpCircle,
    Globe, Instagram, MessageSquare, Check, Trash2, X, Share2, Flag
} from 'lucide-react';
import Image from 'next/image';

import { joinGroup, leaveGroup, deleteGroup, cancelJoinRequest } from '@/actions/group-actions';
import { Link, useRouter } from '@/i18n/routing';
import { clsx } from 'clsx';
import ApplicationModal from '../modals/ApplicationModal';
import ReportModal from '../modals/ReportModal';
import AuthGateModal from '../modals/AuthGateModal';
import InquiryModal from '../modals/InquiryModal';
import SupportMessageModal from '../modals/SupportMessageModal';
import { useAuthGate } from '@/lib/useAuthGate';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { getSmartImageUrl } from '@/lib/image-utils';
import { usePathname } from '@/i18n/routing';

import type { GroupContext } from '@/lib/services/group.service';

type Props = {
    group: GroupContext;
    l1Slug: string;
};

export default function GroupHeader({ group, l1Slug }: Props) {
    const t = useTranslations('group');
    const locale = useLocale();
    const router = useRouter();
    const { userRole, isMember, accentColor } = useGroupContext();
    const [isPending, startTransition] = useTransition();
    const [isAppModalOpen, setAppModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isInquiryModalOpen, setInquiryModalOpen] = useState(false);
    const [isSupportModalOpen, setSupportModalOpen] = useState(false);
    const [isMoreOpen, setMoreOpen] = useState(false);
    const [isContactsOpen, setContactsOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);
    const contactsRef = useRef<HTMLDivElement>(null);
    const { gateAction, isModalOpen, closeModal, pendingAction, pendingUrl, isAuthenticated, clearPendingAction } = useAuthGate();
    const pathname = usePathname();

    const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';
    const isOwner = userRole === 'OWNER';

    // Close more menu on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMembership = () => {
        gateAction(() => {
            if (isMember) return;

            if (!group.isAcceptingMembers) {
                setInquiryModalOpen(true);
                return;
            }

            setAppModalOpen(true);
        }, 'join_group');
    };

    // Auto-resume action after login
    useEffect(() => {
        if (isAuthenticated && pendingAction === 'join_group' && pendingUrl === pathname) {
            clearPendingAction();
            handleMembership();
        }
    }, [isAuthenticated, pendingAction, pendingUrl, pathname]);

    const handleCancelRequest = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmCancelRequest') || 'Withdraw join request?')) {
            startTransition(async () => {
                await cancelJoinRequest(group.id, locale);
            });
        }
    };

    const handleReport = () => {
        gateAction(() => setReportModalOpen(true));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        // Show a brief toast or alert? For now just alert or silent
        alert(t('linkCopied')); // We might need to add this key or just use a generic message
    };

    // Build breadcrumb segments: L1 > L2
    const breadcrumbSegments = [];

    // Add L1 if it exists
    if (group.category.parentTitle) {
        breadcrumbSegments.push({
            label: group.category.parentTitle,
            href: `/?cat=${l1Slug}`
        });
    }

    // Add L2 (the current group category)
    breadcrumbSegments.push({
        label: group.category.title,
        href: `/?cat=${l1Slug}&tag=${group.category.slug}`
    });

    return (
        <header
            className="relative z-40 bg-surface border-b border-border shadow-premium transition-shadow duration-300"
            suppressHydrationWarning
        >
            {/* Banner Image Support */}
            {group.bannerImage ? (
                <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
                    <Image
                        src={getSmartImageUrl(group.bannerImage)}
                        alt={group.name}
                        fill
                        priority
                        unoptimized
                        className="object-cover"
                    />
                    {/* Multi-step scrim for robust legibility on any background */}
                    <div className="absolute inset-0 z-10">
                        {/* Soft full-width bottom protection - darker/more transparent to avoid fog */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Branded Identity - Solid accent tint at the very bottom fading up */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-70 bg-gradient-to-t from-[color:var(--accent)] to-transparent" />

                        {/* Top protection for breadcrumbs - subtle dark gradient */}
                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Immersive background gradient accent when no image */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(ellipse_at_80%_0%,var(--accent)_0%,transparent_60%),radial-gradient(ellipse_at_20%_100%,var(--accent)_0%,transparent_60%)]" />
                    {/* Soft background glow */}
                    <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-[0.05] blur-[100px] pointer-events-none bg-[color:var(--accent)]" />
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[color:var(--accent)]" />
                </>
            )}

            <div className="relative z-10 px-4 md:px-8 py-8 max-w-screen-2xl">
                {/* ── Breadcrumb & Mobile Actions ─────────────────────────────── */}
                <div className="mb-4 flex items-start justify-between gap-4">
                    <nav className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-sm" aria-label="breadcrumb">
                        {breadcrumbSegments.map((seg, i) => (
                            <span key={i} className="flex items-center gap-1 sm:gap-1.5">
                                {i > 0 && <ChevronRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-foreground-muted/30 -mx-0.5" />}
                                <Link
                                    href={seg.href}
                                    className={clsx(
                                        "inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-bold transition-all shadow-premium border border-white/10",
                                        "text-[color:var(--accent-foreground)] bg-[color:var(--accent)]"
                                    )}
                                >
                                    {i === breadcrumbSegments.length - 1 && (
                                        <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-current opacity-80" />
                                    )}
                                    {seg.label}
                                </Link>
                            </span>
                        ))}
                    </nav>

                    {/* Mobile-only More Options (Top Aligned with Breadcrumbs) */}
                    <div className="md:hidden relative mt-0.5" ref={moreRef}>
                        <button
                            onClick={() => setMoreOpen(!isMoreOpen)}
                            className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/20 text-white backdrop-blur-md border border-white/10 shadow-premium transition-all active:scale-95"
                            aria-label="More options"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {isMoreOpen && (
                            <div className="absolute right-0 top-9 z-[45] min-w-[220px] max-w-[calc(100vw-32px)] origin-top-right rounded-xl border border-border bg-surface shadow-2xl py-1 shadow-black/20 overflow-hidden text-foreground">
                                {isOwnerOrAdmin && (
                                    <>
                                        <Link
                                            href={`/${l1Slug}/group/${group.slug}/settings`}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors"
                                        >
                                            <Settings className="h-4 w-4" />
                                            {t('groupSettings')}
                                        </Link>
                                        <div className="my-1 border-t border-border/50" />
                                    </>
                                )}
                                <button
                                    onClick={() => {/* Share logic */ }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-elevated transition-colors"
                                >
                                    <Share2 className="h-4 w-4" />
                                    {t('shareGroup')}
                                </button>
                                <button
                                    onClick={handleReport}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                                >
                                    <Flag className="h-4 w-4" />
                                    {t('reportGroup')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Title row ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0">

                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] mb-2">
                            {group.name}
                        </h1>

                        {/* High-contrast metadata row */}
                        <div className="mt-6 flex flex-wrap items-center gap-y-3 gap-x-6 text-[13px] text-white/90">
                            <span className="flex items-center gap-2 group/meta drop-shadow-sm">
                                <MapPin className="h-4 w-4 text-white" />
                                <span className="font-semibold">{group.city}</span>
                            </span>

                            <Link
                                href={`/${l1Slug}/group/${group.slug}/members`}
                                className="flex items-center gap-2 hover:text-white transition-colors group/meta drop-shadow-sm"
                            >
                                <Users className="h-4 w-4 text-white" />
                                <span>
                                    <strong className="font-bold text-sm tracking-tight">{group.memberCount}</strong>
                                    <span className="ml-1 font-medium opacity-80">{t('members')}</span>
                                </span>
                            </Link>

                            <Link
                                href={`/${l1Slug}/group/${group.slug}/events`}
                                className="flex items-center gap-2 hover:text-white transition-colors group/meta drop-shadow-sm"
                            >
                                <Calendar className="h-4 w-4 text-white" />
                                <span>
                                    <strong className="font-bold text-sm tracking-tight">{group.eventCount}</strong>
                                    <span className="ml-1 font-medium opacity-80">{t('events')}</span>
                                </span>
                            </Link>

                            {/* Social Links */}
                            {(group.discordLink || group.websiteLink || group.instagramLink) && (
                                <>
                                    <span className="h-1 w-1 rounded-full bg-white/30" />
                                    <div className="flex items-center gap-3 drop-shadow-sm">
                                        {group.websiteLink && (
                                            <a href={group.websiteLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Website">
                                                <Globe className="h-4 w-4" />
                                            </a>
                                        )}
                                        {group.discordLink && (
                                            <a href={group.discordLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Discord">
                                                <MessageSquare className="h-4 w-4" />
                                            </a>
                                        )}
                                        {group.instagramLink && (
                                            <a href={group.instagramLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Instagram">
                                                <Instagram className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Action buttons ───────────────────────────────────── */}
                    <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 md:mt-0 w-full md:w-auto flex-nowrap">

                        {/* Join / Inquire button - ONLY for non-members */}
                        {!isMember && !isOwner && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handleMembership}
                                    disabled={isPending || userRole === 'PENDING'}
                                    className={clsx(
                                        "flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all disabled:opacity-50",
                                        userRole === 'PENDING'
                                            ? "bg-surface-elevated text-foreground-muted cursor-default"
                                            : "bg-[var(--accent)] text-white shadow-md hover:scale-105 active:scale-95 [box-shadow:0_8px_20px_-4px_color-mix(in_srgb,var(--accent)_25%,transparent),0_4px_8px_-2px_color-mix(in_srgb,var(--accent)_12.5%,transparent)]"
                                    )}
                                >
                                    {isPending ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : userRole === 'PENDING' ? (
                                        <>
                                            <Check className="h-4 w-4 text-[var(--accent)]" />
                                            {t('requested')}
                                        </>
                                    ) : !group.isAcceptingMembers ? (
                                        <>
                                            <HelpCircle className="h-4 w-4" />
                                            {t('inquire')}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            {t('joinGroup')}
                                        </>
                                    )}
                                </button>

                                {userRole === 'PENDING' && !isPending && (
                                    <button
                                        onClick={handleCancelRequest}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group/cancel"
                                        title="Cancel join request"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ··· More menu (Settings + Leave + Report) - Desktop only (Mobile is in breadcrumb row) */}
                        <div className="hidden md:block relative" ref={moreRef}>
                            <button
                                onClick={() => setMoreOpen(o => !o)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted hover:bg-surface-elevated transition-colors"
                                title="More options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {isMoreOpen && (
                                <div className="absolute right-0 top-12 z-[45] min-w-[220px] max-w-[calc(100vw-32px)] origin-top-right rounded-xl border border-border bg-surface shadow-2xl py-1 shadow-black/20 overflow-hidden">
                                    {isOwnerOrAdmin && (
                                        <>
                                            <Link
                                                href={`/${l1Slug}/group/${group.slug}/settings`}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                                                onClick={() => setMoreOpen(false)}
                                            >
                                                <Settings className="h-4 w-4 text-foreground-muted" />
                                                {t('groupSettings')}
                                            </Link>
                                            <div className="h-px bg-border my-1 mx-2" />
                                        </>
                                    )}
                                    <button
                                        onClick={() => { handleCopyLink(); setMoreOpen(false); }}
                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                                    >
                                        <Plus className="h-4 w-4 text-foreground-muted" />
                                        {t('copyLink')}
                                    </button>

                                    <div className="h-px bg-border my-1 mx-2" />

                                    {isMember && !isOwner && (
                                        <button
                                            onClick={() => {
                                                if (confirm(t('confirmLeave'))) {
                                                    startTransition(async () => {
                                                        await leaveGroup(group.id, locale);
                                                        setMoreOpen(false);
                                                    });
                                                }
                                            }}
                                            disabled={isPending}
                                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50/10 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('leaveGroup')}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { handleReport(); setMoreOpen(false); }}
                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground-muted hover:text-red-500 hover:bg-red-50/10 transition-colors"
                                    >
                                        <ShieldAlert className="h-4 w-4" />
                                        {t('reportGroup')}
                                    </button>

                                    {isOwner && (
                                        <>
                                            <div className="h-px bg-border my-1 mx-2" />
                                            <button
                                                onClick={() => {
                                                    if (confirm(t('confirmDelete'))) {
                                                        startTransition(async () => {
                                                            const res = await deleteGroup(group.id, locale);
                                                            if (res.success) {
                                                                router.push('/discover');
                                                            } else {
                                                                alert(res.error);
                                                            }
                                                        });
                                                        setMoreOpen(false);
                                                    }
                                                }}
                                                disabled={isPending}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/20 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {t('deleteGroup')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ApplicationModal
                isOpen={isAppModalOpen}
                onClose={() => setAppModalOpen(false)}
                groupId={group.id}
                groupName={group.name}
                locale={locale}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                targetGroupId={group.id}
            />

            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setInquiryModalOpen(false)}
                groupId={group.id}
                groupName={group.name}
                accentColor={accentColor}
            />

            <SupportMessageModal
                isOpen={isSupportModalOpen}
                onClose={() => setSupportModalOpen(false)}
                groupId={group.id}
                groupName={group.name}
                accentColor={accentColor}
            />


            <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
        </header >
    );
}
