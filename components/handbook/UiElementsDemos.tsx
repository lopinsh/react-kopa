'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AnnouncementItem from '@/components/groups/announcements/AnnouncementItem';
import ChatPanel from '@/components/messages/ChatPanel';
import ConversationList from '@/components/messages/ConversationList';
import ContactForm from '@/components/groups/contact/ContactForm';
import Button from '@/components/ui/Button';
import LanguageEditor from '@/components/ui/LanguageEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FilterChip from '@/components/ui/FilterChip';
import { Toast } from '@/components/ui/Toast';
import { langRecord, type TextLang } from '@/lib/translations';
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
            <div className="flex h-[26rem] overflow-hidden rounded-xl line">
                <ConversationList
                    conversations={samples.conversations}
                    activeId={conversation.id}
                    onOpen={noop}
                    titleOf={(conv) => conv.other?.name ?? ''}
                    className="flex !w-full !border-r-0"
                />
            </div>
            <div className="flex h-[26rem] flex-col overflow-hidden rounded-xl line bg-background">
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
        <div className="grid gap-3 lg:grid-cols-2">
            <AnnouncementItem item={samples.announcement} />
            <AnnouncementItem item={{ ...samples.announcement, visibility: 'MEMBERS_ONLY' }} />
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
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            {TOAST_TYPES.map((type, id) => <Toast key={type} toast={{ id, type, message: t(`toast.${type}`) }} />)}
        </div>
    );
}

/** The pop-ups are full-screen overlays, so they open on request and close again. */
export function PopupDemo() {
    const t = useTranslations('admin.handbook.ui');
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
            {contactOpen && <ContactForm groupId="sample-group" groupName={t('sample.groupName')} allowJoin onClose={() => setContactOpen(false)} />}
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

/** One editor on a sample title: Latvian original, English filled or empty. The real component, with its drafts held here. */
function LanguageEditorSample({ label, englishText, initialMenuOpen = false, startLang = 'lv' }: { label: string; englishText: string; initialMenuOpen?: boolean; startLang?: TextLang }) {
    const t = useTranslations('admin.handbook.ui');
    const [lang, setLang] = useState<TextLang>(startLang);
    const [original, setOriginal] = useState<TextLang>('lv');
    const [texts, setTexts] = useState<Record<TextLang, string>>({ lv: t('sample.langTextLv'), en: englishText });
    return (
        <div className={initialMenuOpen ? 'min-h-[22rem] [&_[role=menu]]:static!' : undefined}>
            <p className="mb-2 text-tag text-foreground-muted">{label}</p>
            <LanguageEditor
                lang={lang}
                onLangChange={setLang}
                originalLang={original}
                onOriginalLangChange={setOriginal}
                filled={langRecord((l) => texts[l].trim() !== '')}
                onCopyFromOriginal={(l) => setTexts((prev) => ({ ...prev, [l]: prev[original] }))}
                onClear={(l) => setTexts((prev) => ({ ...prev, [l]: '' }))}
                initialMenuOpen={initialMenuOpen}
            >
                <label className="block text-button-sm text-foreground">
                    {t('sample.langTitle')}
                    <input
                        key={lang}
                        lang={lang}
                        value={texts[lang]}
                        onChange={(e) => setTexts((prev) => ({ ...prev, [lang]: e.target.value }))}
                        className="mt-1.5 block h-11 w-full rounded-xl line bg-surface px-3 text-body-sm md:h-10"
                    />
                </label>
            </LanguageEditor>
        </div>
    );
}

export function LanguageEditorDemo() {
    const t = useTranslations('admin.handbook.ui');
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <LanguageEditorSample label={t('sample.langClosed')} englishText={t('sample.langTextEn')} />
            <LanguageEditorSample label={t('sample.langMenu')} englishText={t('sample.langTextEn')} initialMenuOpen />
            <LanguageEditorSample label={t('sample.langEmpty')} englishText="" startLang="en" />
        </div>
    );
}
