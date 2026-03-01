'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import { NAV_LINKS } from '@/lib/navigation';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthGate } from '@/lib/useAuthGate';
import AuthGateModal from '@/components/modals/AuthGateModal';

export default function MobileNav() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const router = useRouter();
    const { gateAction, isModalOpen, closeModal } = useAuthGate();

    // Split nav links dynamically around the center button
    const mid = Math.ceil(NAV_LINKS.length / 2);
    const leftLinks = NAV_LINKS.slice(0, mid);
    const rightLinks = NAV_LINKS.slice(mid);

    return (
        <>
            <nav
                className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-border bg-surface md:hidden"
                aria-label="Mobile navigation"
            >
                {/* Left links */}
                {leftLinks.map(({ href, labelKey, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <MobileNavLink
                            key={href}
                            href={href}
                            label={t(labelKey as any)}
                            isActive={isActive}
                        >
                            <Icon
                                className={clsx('h-5 w-5', isActive ? 'text-primary' : 'text-foreground-muted')}
                                strokeWidth={isActive ? 2.25 : 1.75}
                            />
                        </MobileNavLink>
                    );
                })}

                {/* Center Create Button — always visible */}
                <div className="flex flex-1 items-center justify-center">
                    <button
                        onClick={() => gateAction(() => router.push('/create'))}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
                        aria-label={t('create')}
                    >
                        <Plus className="h-6 w-6" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Right links */}
                {rightLinks.map(({ href, labelKey, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <MobileNavLink
                            key={href}
                            href={href}
                            label={t(labelKey as any)}
                            isActive={isActive}
                        >
                            <Icon
                                className={clsx('h-5 w-5', isActive ? 'text-primary' : 'text-foreground-muted')}
                                strokeWidth={isActive ? 2.25 : 1.75}
                            />
                        </MobileNavLink>
                    );
                })}
            </nav>

            <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
}

function MobileNavLink({
    href,
    label,
    isActive,
    children,
}: {
    href: string;
    label: string;
    isActive: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-foreground-muted'
            )}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
            <span>{label}</span>
        </Link>
    );
}
