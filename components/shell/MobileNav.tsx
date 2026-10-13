'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link, useRouter } from '@/i18n/routing';
import { BOTTOM_LINKS, type BottomLink, type BottomTab } from '@/lib/navigation';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthGate } from '@/lib/useAuthGate';
import { useBottomTab } from '@/hooks/useBottomTab';
import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';
import UnreadBadge from './UnreadBadge';
import AuthGateModal from '@/components/modals/AuthGateModal';
import { UI } from '@/lib/constants';

const CELL = 'relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-foreground-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary';

function Cell({ link, marked }: { link: BottomLink; marked: boolean }) {
    const t = useTranslations('nav');
    const unread = useUnreadMessages();
    const Icon = link.icon;
    const withCount = link.tab === 'messages';
    const label = withCount && unread > 0 ? t('messagesUnread', { count: unread }) : undefined;
    return (
        <Link href={link.href} aria-label={label} aria-current={marked ? 'page' : undefined} className={clsx(CELL, marked && 'font-semibold text-foreground')}>
            <span className={clsx('rounded-full px-3.5 py-[3px]', marked && 'bg-primary/16')}>
                <Icon aria-hidden className="size-5" strokeWidth={marked ? 2.25 : 1.75} />
            </span>
            <span>{t(link.labelKey)}</span>
            {withCount && <UnreadBadge />}
        </Link>
    );
}

/** The phone bottom bar (AR-19): Atklāt, Grupas, +, Ziņas, Es. `initialTab` is the cookie value the server read. */
export default function MobileNav({ initialTab }: { initialTab: BottomTab }) {
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const pathname = usePathname();
    const router = useRouter();
    const { gateAction, isModalOpen, closeModal } = useAuthGate();
    const marked = useBottomTab(initialTab);

    if (pathname.startsWith('/auth')) return null;

    const cells = BOTTOM_LINKS.map((link) => <Cell key={link.tab} link={link} marked={marked === link.tab} />);

    return (
        <>
            <nav data-ui={UI.mobileNav} className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-surface md:hidden" aria-label={t('mobileLabel')}>
                {cells.slice(0, 2)}
                <div className="flex h-full flex-1 items-center justify-center">
                    <button
                        type="button"
                        onClick={() => gateAction(() => router.push('/create'))}
                        className="grid size-16 place-items-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                        aria-label={tCommon('createGroup')}
                    >
                        <span className="grid size-[34px] place-items-center rounded-full text-foreground ring-[1.5px] ring-border">
                            <Plus aria-hidden className="size-5" />
                        </span>
                    </button>
                </div>
                {cells.slice(2)}
            </nav>

            <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
}
