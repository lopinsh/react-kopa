'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { clsx } from 'clsx';
import { Info, Calendar, MessageSquare, Users, HelpCircle, Settings, Menu, LucideIcon } from 'lucide-react';
import { useGroupContext } from '@/components/providers/GroupProvider';
import GroupInfoDrawer from './GroupInfoDrawer';
import type { GroupContext } from '@/lib/services/group.service';
import { hasAdminRights } from '@/lib/utils/permissions';

type Props = {
    group: GroupContext;
    l1Slug: string;
    pendingCount: number;
};

export default function GroupTabs({ group, l1Slug, pendingCount }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const pathname = usePathname();
    const locale = useLocale();
    const { isMember, userRole, sections } = useGroupContext();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    interface Tab {
        id: string;
        label: string;
        href: string;
        icon: LucideIcon;
        memberOnly?: boolean;
        adminOnly?: boolean;
        needsInstructions?: boolean;
    }

    const baseUrl = `/${l1Slug}/group/${group.slug}`;

    // Track active section for scroll-spy
    const [activeSection, setActiveSection] = useState<string>('about');

    // Check if we are on the base URL (information page)
    const normalizedPath = pathname.replace(`/${locale}`, '') || '/';
    const isLandingPage = normalizedPath === baseUrl || normalizedPath === `${baseUrl}/`;

    // Static horizontal tabs for non-landing pages (matching sidebar links)
    const BASE_NAV = [
        { id: 'info', icon: Info, label: c_common('informationTitle'), href: baseUrl, memberOnly: false },
        { id: 'events', icon: Calendar, label: c_common('eventsTitle'), href: `${baseUrl}/events`, memberOnly: false },
        { id: 'discussions', icon: MessageSquare, label: c_common('discussionTitle'), href: `${baseUrl}/discussions`, memberOnly: true },
        { id: 'members', icon: Users, label: c_common('membersTitle'), href: `${baseUrl}/members`, memberOnly: true },
    ];

    // Map dynamic sections to tabs (only used on the information page)
    const sectionTabs: Tab[] = sections.map((s, index) => ({
        id: index === 0 ? 'about' : s.id,
        label: index === 0 ? c_common('about') : s.title,
        href: `${baseUrl}#${index === 0 ? 'about' : s.id}`, // prepend baseUrl so navigating from other tabs works
        icon: index === 0 ? Info : HelpCircle,
        memberOnly: s.visibility === 'MEMBERS_ONLY',
    }));

    const tabs: Tab[] = isLandingPage ? sectionTabs : BASE_NAV;

    // Scroll-Spy Implementation
    useEffect(() => {
        const mainContent = document.getElementById('main-content');

        const observerOptions = {
            root: mainContent,
            rootMargin: '-5% 0px -85% 0px', // Trigger when section is in the top portion
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            const scrollTop = mainContent?.scrollTop ?? 0;
            const scrollHeight = mainContent?.scrollHeight ?? 0;
            const clientHeight = mainContent?.clientHeight ?? 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
            const isAtTop = scrollTop < 50;

            if (isAtTop || isAtBottom) return;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach((s, index) => {
            const id = index === 0 ? 'about' : s.id;
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        const handleManualScroll = () => {
            if (!mainContent) return;
            const scrollTop = mainContent.scrollTop;
            const scrollHeight = mainContent.scrollHeight;
            const clientHeight = mainContent.clientHeight;

            if (scrollTop < 50) {
                setActiveSection('about');
            } else if (scrollTop + clientHeight >= scrollHeight - 50) {
                const lastTabId = sections.length > 0 ? (sections.length === 1 ? 'about' : sections[sections.length - 1].id) : 'about';
                setActiveSection(lastTabId);
            }
        };

        mainContent?.addEventListener('scroll', handleManualScroll, { passive: true });

        return () => {
            observer.disconnect();
            mainContent?.removeEventListener('scroll', handleManualScroll);
        };
    }, [sections]);

    const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tabId: string) => {
        // If we're on the landing page, handle scroll-spy behavior for section tabs
        if (isLandingPage && tabId && sectionTabs.some(t => t.id === tabId)) {
            e.preventDefault();

            if (tabId === 'about') {
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                    window.history.pushState(null, '', baseUrl);
                    setActiveSection('about');
                    return;
                }
            }

            const element = document.getElementById(tabId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${tabId}`);
            }
        }
    };

    const isOwnerOrAdmin = hasAdminRights(userRole);

    // Handle sticky state detection using IntersectionObserver
    const sentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // We use isIntersecting to toggle sticky styles
                setIsScrolled(!entry.isIntersecting);
            },
            {
                threshold: [0, 1],
                rootMargin: '0px 0px 0px 0px'
            }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className={clsx(
                "z-30 transition-all duration-300 sticky top-0 bg-surface",
                isScrolled
                    ? "backdrop-blur-md border-b border-border shadow-premium"
                    : "border-b border-border/50"
            )}
        >
            <div ref={sentinelRef} className="absolute -top-px h-px w-full pointer-events-none" />

            <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-2 relative">
                    {/* Mobile Navigation Trigger - Now in standard flow */}
                    <div className="md:hidden shrink-0 py-2">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border/50 text-foreground shadow-card active:scale-95 transition-all"
                            aria-label={c_common('navigationMenu')}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    <nav
                        ref={navRef}
                        className="flex-1 flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar scroll-smooth [mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]"
                    >
                        {tabs.map((tab) => {
                            const isAbout = tab.id === 'about';
                            const active = isAbout ? activeSection === 'about' || activeSection === sections[0]?.id : activeSection === tab.id;

                            if (tab.memberOnly && !isMember) return null;
                            if (tab.needsInstructions && !group.instructions) return null;
                            if (tab.adminOnly && !isOwnerOrAdmin) return null;


                            // For base nav, active state relies on the URL
                            let isBaseNavActive = false;
                            if (!isLandingPage) {
                                const normalizedHref = (tab.href as string).split('?')[0] || '/';
                                isBaseNavActive = tab.id === 'info'
                                    ? normalizedPath === normalizedHref || normalizedPath === `${normalizedHref}/`
                                    : normalizedPath.startsWith(normalizedHref) && !pathname.includes('/settings');
                            }

                            const finalActive = isLandingPage ? active : isBaseNavActive;

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href as any}
                                    onClick={(e) => handleTabClick(e, tab.id)}
                                    className={clsx(
                                        "relative flex items-center gap-2 px-4 transition-all border-b-2 whitespace-nowrap flex-shrink-0 font-bold uppercase tracking-wider text-[10px]",
                                        isScrolled ? "pt-4 pb-5" : "pt-5 pb-6",
                                        finalActive
                                            ? "border-[var(--accent)] text-[var(--accent)]"
                                            : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
                                    )}
                                    style={finalActive ? {
                                        boxShadow: `0 1px 0 0 var(--accent)`,
                                        filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--accent), transparent 60%))`
                                    } : undefined}
                                >
                                    <div className="relative">
                                        <tab.icon className="h-3.5 w-3.5" />
                                        {tab.id === 'members' && pendingCount > 0 && isOwnerOrAdmin && (
                                            <span className="absolute -top-1.5 -right-2 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-black text-white shadow-sm ring-1 ring-surface animate-in zoom-in duration-300">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </div>
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Info Drawer */}
            <GroupInfoDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                group={group}
                l1Slug={l1Slug}
                groupSlug={group.slug}
            />
        </div>
    );
}
