'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { clsx } from 'clsx';
import { Info, Calendar, MessageSquare, Users, HelpCircle, Settings, Menu } from 'lucide-react';
import { useGroupContext } from '@/components/providers/GroupProvider';
import GroupInfoDrawer from './GroupInfoDrawer';

type Props = {
    group: any;
    l1Slug: string;
    pendingCount: number;
};

export default function GroupTabs({ group, l1Slug, pendingCount }: Props) {
    const t = useTranslations('group');
    const pathname = usePathname();
    const locale = useLocale();
    const { isMember, userRole, accentColor, sections } = useGroupContext();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    interface Tab {
        id: string;
        label: string;
        href: string;
        icon: any;
        memberOnly?: boolean;
        adminOnly?: boolean;
        needsInstructions?: boolean;
    }

    const baseUrl = `/${l1Slug}/group/${group.slug}`;

    // Track active section for scroll-spy
    const [activeSection, setActiveSection] = useState<string>('about');

    // Map dynamic sections to tabs
    const tabs: Tab[] = sections.map((s, index) => ({
        id: index === 0 ? 'about' : s.id,
        label: index === 0 ? t('descriptionTitle') : s.title,
        href: `#${index === 0 ? 'about' : s.id}`,
        icon: index === 0 ? Info : HelpCircle,
        memberOnly: s.visibility === 'MEMBERS_ONLY',
    }));

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
        const isLandingPage = pathname.replace(`/${locale}`, '') === baseUrl || pathname.replace(`/${locale}`, '') === `${baseUrl}/`;

        if (isLandingPage && tabId) {
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

    const accentStyle = { '--accent': accentColor } as React.CSSProperties;
    const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

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
            style={accentStyle}
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
                            aria-label={t('navigationMenu')}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    <nav
                        ref={navRef as any}
                        className="flex-1 flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar scroll-smooth [mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]"
                    >
                        {tabs.map((tab) => {
                            const isAbout = tab.id === 'about';
                            const active = isAbout ? activeSection === 'about' || activeSection === sections[0]?.id : activeSection === tab.id;

                            if (tab.memberOnly && !isMember) return null;
                            if ((tab as any).needsInstructions && !group.hasInstructions) return null;
                            if (tab.adminOnly && !isOwnerOrAdmin) return null;

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href as any}
                                    onClick={(e) => handleTabClick(e, tab.id)}
                                    className={clsx(
                                        "relative flex items-center gap-2 px-4 transition-all border-b-2 whitespace-nowrap flex-shrink-0 font-bold uppercase tracking-wider text-[10px]",
                                        isScrolled ? "pt-4 pb-5" : "pt-5 pb-6",
                                        active
                                            ? "border-[var(--accent)] text-[var(--accent)]"
                                            : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
                                    )}
                                    style={active ? {
                                        boxShadow: `0 1px 0 0 var(--accent)`,
                                        filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--accent), transparent 60%))`
                                    } : undefined}
                                >
                                    <tab.icon className="h-3.5 w-3.5" />
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
                accentColor={accentColor}
            />
        </div>
    );
}
