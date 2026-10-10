'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import AnnouncementCard from '@/components/groups/AnnouncementCard';
import ChatPanel from '@/components/messages/ChatPanel';
import ConversationList from '@/components/messages/ConversationList';
import ContactGroupModal from '@/components/modals/ContactGroupModal';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FilterChip from '@/components/ui/FilterChip';
import { Toast } from '@/components/ui/Toast';
import type { UiSamples } from '@/lib/handbook/ui-samples';
import type { ToastType } from '@/hooks/use-toast';

const noop = () => undefined;
const TOAST_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'];

/** The inbox list and an open chat with bubbles, as the Messages page shows them. */
export function InboxDemo({ samples }: { samples: UiSamples }) {
    const t = useTranslations('admin.handbook.ui');
    const conversation = samples.conversations[0];
    return (
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <div className="flex h-[26rem] overflow-hidden rounded-xl border border-border">
                <ConversationList
                    conversations={samples.conversations}
                    activeId={conversation.id}
                    onOpen={noop}
                    titleOf={(conv) => conv.other?.name ?? ''}
                    className="flex !w-full !border-r-0"
                />
            </div>
            <div className="flex h-[26rem] flex-col overflow-hidden rounded-xl border border-border bg-background">
                <ChatPanel
                    conversation={conversation}
                    messages={samples.chatMessages}
                    currentUserId={samples.viewerId}
                    title={samples.marta.name ?? ''}
                    unknownName={t('unknownName')}
                    onBack={noop}
                    onSent={noop}
                    onBlockedChange={noop}
                />
            </div>
        </div>
    );
}

export function AnnouncementDemo({ samples }: { samples: UiSamples }) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <AnnouncementCard post={samples.announcement} canManage={false} busy={false} onArchive={noop} onDelete={noop} />
            <AnnouncementCard post={samples.announcement} canManage busy={false} onArchive={noop} onDelete={noop} />
        </div>
    );
}

export function ChipDemo() {
    const t = useTranslations('admin.handbook.ui');
    const [active, setActive] = useState(0);
    const labels = [t('chipAll'), t('chipPersonal'), t('chipGroups')];
    return (
        <div className="flex flex-wrap gap-2">
            {labels.map((label, i) => <FilterChip key={label} active={active === i} onClick={() => setActive(i)}>{label}</FilterChip>)}
        </div>
    );
}

export function ToastDemo() {
    const t = useTranslations('admin.handbook.ui');
    return (
        <div className="mx-auto flex max-w-md flex-col gap-3">
            {TOAST_TYPES.map((type) => <Toast key={type} toast={{ id: type, type, message: t(`toast.${type}`) }} onClose={noop} />)}
        </div>
    );
}

/** The pop-ups are full-screen overlays, so they open on request and close again. */
export function PopupDemo() {
    const t = useTranslations('admin.handbook.ui');
    const locale = useLocale();
    const [contactOpen, setContactOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [destructiveOpen, setDestructiveOpen] = useState(false);

    return (
        <>
            <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setContactOpen(true)}>{t('openContact')}</Button>
                <Button variant="secondary" onClick={() => setConfirmOpen(true)}>{t('openConfirm')}</Button>
                <Button variant="secondary" onClick={() => setDestructiveOpen(true)}>{t('openDestructive')}</Button>
            </div>
            <ContactGroupModal
                isOpen={contactOpen}
                onClose={() => setContactOpen(false)}
                groupId="sample-group"
                groupName={t('sample.groupName')}
                locale={locale}
                allowJoin
            />
            <ConfirmDialog
                isOpen={confirmOpen}
                title={t('confirmTitle')}
                message={t('confirmMessage')}
                confirmLabel={t('confirmLabel')}
                onConfirm={() => setConfirmOpen(false)}
                onCancel={() => setConfirmOpen(false)}
            />
            <ConfirmDialog
                isOpen={destructiveOpen}
                destructive
                title={t('destructiveTitle')}
                message={t('destructiveMessage')}
                confirmLabel={t('destructiveLabel')}
                onConfirm={() => setDestructiveOpen(false)}
                onCancel={() => setDestructiveOpen(false)}
            />
        </>
    );
}
