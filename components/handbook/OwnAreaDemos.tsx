'use client';

import { useTranslations } from 'next-intl';
import { Bell, MessageSquare } from 'lucide-react';
import ConversationRow from '@/components/messages/ConversationRow';
import BellPanel from '@/components/notifications/BellPanel';
import NotificationItem from '@/components/notifications/NotificationItem';
import NotificationList from '@/components/notifications/NotificationList';
import NewsItem from '@/components/me/NewsItem';
import RequestRow from '@/components/me/RequestRow';
import SectionMenu from '@/components/me/SectionMenu';
import { DropdownFooter, DropdownHead } from '@/components/shell/DropdownParts';
import EmptyState from '@/components/ui/EmptyState';
import type { UiSamples } from '@/lib/handbook/ui-samples';

const noop = () => undefined;
const PANEL = 'w-[360px] max-w-full overflow-hidden rounded-[14px] border border-border bg-surface shadow-premium';

/** Manas grupas' parts: the section menu, a news post and an answer, a request that waits. */
export function MyGroupsPartsDemo({ samples }: { samples: UiSamples }) {
    const t = useTranslations('profile.myGroups');
    const now = new Date();
    return (
        <div className="grid max-w-2xl gap-4">
            {/* The menu is sticky on the real page; here it stays where it is drawn. */}
            <div className="[&_[data-ui='section-menu']]:static">
                <SectionMenu sections={[{ key: 'upcoming', label: t('upcoming') }, { key: 'news', label: t('news') }, { key: 'groups', label: t('groups') }, { key: 'requests', label: t('requests') }]} />
            </div>
            <ul className="rounded-2xl bg-surface px-3.5">
                <li className="py-3"><NewsItem item={samples.newsPost} now={now} /></li>
                <li className="border-t border-border py-3"><NewsItem item={samples.newsAnswer} now={now} /></li>
            </ul>
            <ul className="rounded-2xl border border-border"><RequestRow request={samples.myRequest} /></ul>
        </div>
    );
}

/** The two small lists of the header as they open, each in its 360 px panel, a notification row each way and the empty bell. */
export function HeaderListsDemo({ samples }: { samples: UiSamples }) {
    const t = useTranslations('notifications');
    const tMessages = useTranslations('messages');
    const [group, personal] = samples.conversations;
    return (
        <div className="flex flex-wrap items-start gap-4">
            <div className={PANEL}>
                <BellPanel headingId="demo-bell" isAdmin tab="USER" onTab={noop} counts={{ user: 1, admin: 1 }} onMarkAll={noop}>
                    <NotificationList rows={samples.notifications} onRead={noop} />
                </BellPanel>
            </div>
            <div className={PANEL}>
                <BellPanel headingId="demo-bell-admin" isAdmin tab="ADMIN" onTab={noop} counts={{ user: 1, admin: 1 }} onMarkAll={noop}>
                    <NotificationList rows={[samples.adminNotification]} onRead={noop} />
                </BellPanel>
            </div>
            <div className={PANEL}>
                <DropdownHead id="demo-messages" title={tMessages('title')} />
                <ConversationRow conversation={group} title={group.other?.name ?? ''} href="/messages" />
                <ConversationRow conversation={personal} title={personal.other?.name ?? ''} href="/messages" />
                <DropdownFooter href="/messages" label={tMessages('allMessages')} />
            </div>
            <div className={PANEL}>
                <DropdownHead id="demo-bell-empty" title={t('title')} />
                <EmptyState icon={Bell} title={t('emptyTitle')} description={t('emptyText')} />
                <EmptyState icon={MessageSquare} title={tMessages('emptyTitle')} description={tMessages('emptyText')} />
            </div>
            <ul className="w-[360px] max-w-full overflow-hidden rounded-2xl bg-surface">
                <NotificationItem n={samples.notifications[0]} onRead={noop} />
            </ul>
        </div>
    );
}
