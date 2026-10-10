'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cityLabel } from '@/lib/city-label';
import {
    MapPin, Users, Calendar, UserPlus,
    ChevronRight, HelpCircle,
    Globe, Instagram, MessageSquare, Check, X,
    Shield, User
} from 'lucide-react';
import Image from 'next/image';

import dynamic from 'next/dynamic';
import { cancelJoinRequest } from '@/actions/group-actions';
import { Link } from '@/i18n/routing';
import { clsx } from 'clsx';
const ContactGroupModal = dynamic(() => import('../modals/ContactGroupModal'), { ssr: false });
const ReportModal = dynamic(() => import('../modals/ReportModal'), { ssr: false });
const HideGroupModal = dynamic(() => import('../modals/HideGroupModal'), { ssr: false });
const AuthGateModal = dynamic(() => import('../modals/AuthGateModal'), { ssr: false });

import { useAuthGate } from '@/lib/useAuthGate';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { getSmartImageUrl } from '@/lib/image-utils';
import { usePathname } from '@/i18n/routing';
import { getCategoryIcon } from '@/lib/icons';
import { isOwner as checkIsOwner } from '@/lib/utils/permissions';

import type { GroupContext } from '@/lib/services/group.service';
import CompactGroupBar from './CompactGroupBar';
import GroupMoreMenu from './GroupMoreMenu';
import AdminToolsMenu from './AdminToolsMenu';
import { getContrastForeground } from '@/lib/color-utils';

type Props = {
    group: GroupContext;
    l1Slug: string;
};

export default function GroupHeader({ group, l1Slug }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const { user } = useGroupContext();
    const { role: userRole, isMember } = user;
    const [isPending, startTransition] = useTransition();
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isHideModalOpen, setHideModalOpen] = useState(false);
    const [isContactsOpen, setContactsOpen] = useState(false);
    const contactsRef = useRef<HTMLDivElement>(null);
    const { gateAction, isModalOpen, closeModal, pendingAction, pendingUrl, isAuthenticated, clearPendingAction } = useAuthGate();
    const pathname = usePathname();

    const isOwner = checkIsOwner(userRole);

    const handleMembership = () => {
        gateAction(() => {
            if (isMember) return;
            setContactModalOpen(true);
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
        if (confirm(t('confirmCancelRequest'))) {
            startTransition(async () => {
                await cancelJoinRequest(group.id, locale);
            });
        }
    };

    const handleReport = () => {
        gateAction(() => setReportModalOpen(true));
    };

    interface BreadcrumbSegment {
        label: string;
        href: string;
        isL1: boolean;
        slug?: string;
    }

    // Build breadcrumb segments: L1 > L2
    const breadcrumbSegments: BreadcrumbSegment[] = [];

    // Add L1 if it exists
    if (group.category.parentTitle) {
        breadcrumbSegments.push({
            label: group.category.parentTitle,
            href: `/?category=${l1Slug}`,
            isL1: true,
            slug: l1Slug
        });
    }

    // Add L2 (the current group category)
    breadcrumbSegments.push({
        label: group.category.title,
        href: `/?category=${l1Slug}&tags=${group.category.slug}`,
        isL1: false
    });

    const { socialLinks, stats, user: groupUser, theme } = group;

    // The Events tab, event pages and settings get a slim bar so the content starts near the top.
    const normalizedPath = pathname.replace(`/${locale}`, '') || '/';
    const groupBase = `/${l1Slug}/group/${group.slug}`;
    if (normalizedPath.startsWith(`${groupBase}/events`) || normalizedPath.startsWith(`${groupBase}/settings`)) {
        return <CompactGroupBar group={group} l1Slug={l1Slug} />;
    }

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
                        {breadcrumbSegments.map((seg, i) => {
                            const L1Color = group.category.color;
                            const Icon = seg.isL1 && seg.slug ? getCategoryIcon(seg.slug) : null;
                            const l1Text = getContrastForeground(L1Color || '#3B82F6');

                            return (
                                <span key={i} className="flex items-center gap-1 sm:gap-1.5">
                                    {i > 0 && <ChevronRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-foreground-muted/30 -mx-0.5" />}
                                    <Link
                                        href={seg.href}
                                        className={clsx(
                                            "inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-bold transition-all shadow-premium border",
                                            seg.isL1
                                                ? "border-white/10"
                                                : "border-[color:var(--l1-color)] bg-[color:var(--l2-bg)] text-[color:var(--l2-text)]"
                                        )}
                                        style={{
                                            backgroundColor: (seg.isL1 ? L1Color : undefined) as string | undefined,
                                            color: seg.isL1 ? l1Text : undefined,
                                            ['--l1-color' as string]: L1Color,
                                            ['--l2-bg' as string]: `color-mix(in srgb, ${L1Color} 15%, var(--surface))`,
                                            ['--l2-text' as string]: `color-mix(in srgb, ${L1Color} 60%, var(--foreground))`,
                                        } as React.CSSProperties}
                                    >
                                        {seg.isL1 && Icon && (
                                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: l1Text === 'white' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)' }} strokeWidth={2.5} />
                                        )}
                                        {i === breadcrumbSegments.length - 1 && !seg.isL1 && (
                                            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-current opacity-80" />
                                        )}
                                        {seg.label}
                                    </Link>
                                </span>
                            );
                        })}
                    </nav>

                    <div className="mt-0.5 flex items-center gap-2 md:hidden">
                        <AdminToolsMenu
                            group={group}
                            l1Slug={l1Slug}
                            variant="overlay"
                            onHide={() => setHideModalOpen(true)}
                        />
                        <GroupMoreMenu
                            group={group}
                            l1Slug={l1Slug}
                            variant="overlay"
                            onReport={handleReport}
                        />
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
                                <span className="font-semibold">{cityLabel(tCities, group.city)}</span>
                            </span>

                            <Link
                                href={`/${l1Slug}/group/${group.slug}/members`}
                                className="flex items-center gap-2 hover:text-white transition-colors group/meta drop-shadow-sm"
                            >
                                <Users className="h-4 w-4 text-white" />
                                <span className="font-medium">
                                    {t.rich('membersCount', { count: stats.memberCount, b: (chunks) => <strong className="font-bold text-sm tracking-tight">{chunks}</strong> })}
                                </span>
                            </Link>

                            <Link
                                href={`/${l1Slug}/group/${group.slug}/events`}
                                className="flex items-center gap-2 hover:text-white transition-colors group/meta drop-shadow-sm"
                            >
                                <Calendar className="h-4 w-4 text-white" />
                                <span className="font-medium">
                                    {t.rich('eventsCount', { count: stats.eventCount, b: (chunks) => <strong className="font-bold text-sm tracking-tight">{chunks}</strong> })}
                                </span>
                            </Link>

                            {/* Social Links */}
                            {(socialLinks.discord || socialLinks.website || socialLinks.instagram) && (
                                <>
                                    <span className="h-1 w-1 rounded-full bg-white/30" />
                                    <div className="flex items-center gap-3 drop-shadow-sm">
                                        {socialLinks.website && (
                                            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Website">
                                                <Globe className="h-4 w-4" />
                                            </a>
                                        )}
                                        {socialLinks.discord && (
                                            <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Discord">
                                                <MessageSquare className="h-4 w-4" />
                                            </a>
                                        )}
                                        {socialLinks.instagram && (
                                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors" title="Instagram">
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
                                            : "bg-[var(--accent)] text-white shadow-md hover:opacity-90 active:scale-95"
                                    )}
                                >
                                    {isPending ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : userRole === 'PENDING' ? (
                                        <>
                                            <Check className="h-4 w-4 text-[var(--accent)]" />
                                            {c_common('requested')}
                                        </>
                                    ) : !group.isAcceptingMembers ? (
                                        <>
                                            <HelpCircle className="h-4 w-4" />
                                            {c_common('contact')}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            {c_common('joinGroup')}
                                        </>
                                    )}
                                </button>

                                {userRole === 'PENDING' && !isPending && (
                                    <button
                                        onClick={handleCancelRequest}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-foreground-muted hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group/cancel"
                                        title="Cancel join request"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Member Status Badge - ONLY for members/admins/owners */}
                        {(isMember || isOwner) && (
                            <div className="flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold border border-white/10 bg-white/10 text-white shadow-premium backdrop-blur-md">
                                {isOwner ? (
                                    <><Shield className="h-4 w-4 text-emerald-400" /> {c_common('role_owner')}</>
                                ) : userRole === 'ADMIN' ? (
                                    <><Shield className="h-4 w-4 text-blue-400" /> {c_common('role_admin')}</>
                                ) : (
                                    <><User className="h-4 w-4 text-white/70" /> {c_common('role_member')}</>
                                )}
                            </div>
                        )}

                        <AdminToolsMenu
                            group={group}
                            l1Slug={l1Slug}
                            variant="bar"
                            className="hidden md:block"
                            onHide={() => setHideModalOpen(true)}
                        />
                        <GroupMoreMenu
                            group={group}
                            l1Slug={l1Slug}
                            variant="bar"
                            className="hidden md:block"
                            onReport={handleReport}
                        />
                    </div>
                </div>
            </div>

            {isContactModalOpen && (
                <ContactGroupModal
                    isOpen={isContactModalOpen}
                    onClose={() => setContactModalOpen(false)}
                    groupId={group.id}
                    groupName={group.name}
                    locale={locale}
                    allowJoin={group.isAcceptingMembers}
                />
            )}

            {isHideModalOpen && (
                <HideGroupModal
                    isOpen={isHideModalOpen}
                    onClose={() => setHideModalOpen(false)}
                    groupId={group.id}
                />
            )}

            {isReportModalOpen && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    targetGroupId={group.id}
                />
            )}

            {isModalOpen && <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />}
        </header >
    );
}
