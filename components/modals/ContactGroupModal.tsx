'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { joinGroup, sendInquiry } from '@/actions/group-actions';
import { Link } from '@/i18n/routing';
import { MESSAGE_MAX_LENGTH, messageTextSchema } from '@/lib/validations/message';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    locale: string;
    /** The group takes new members: show the "I'd like to join" switch (on by default). */
    allowJoin: boolean;
};

/** The one form for writing to a group's team. With the switch on it also files the join request. */
export default function ContactGroupModal({ isOpen, onClose, groupId, groupName, locale, allowJoin }: Props) {
    const t = useTranslations('contactForm');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const [message, setMessage] = useState('');
    const [wantsToJoin, setWantsToJoin] = useState(allowJoin);
    const [error, setError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const joining = allowJoin && wantsToJoin;
    const canSubmit = messageTextSchema.safeParse(message).success && !isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError(null);
        startTransition(async () => {
            const result = joining
                ? await joinGroup(groupId, locale, message)
                : await sendInquiry(groupId, message);
            if (result.success && result.data) {
                setChatId(result.data.conversationId);
            } else if (!result.success) {
                setError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/50 bg-surface p-6 shadow-2xl sm:p-8">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                        {chatId ? t('sentTitle') : joining ? t('titleJoin', { name: groupName }) : t('title', { name: groupName })}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={tCommon('close')}
                        className="rounded-xl p-2 text-foreground-muted transition-all hover:bg-surface-elevated hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {chatId ? (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                            <Check className="h-7 w-7" />
                        </div>
                        <p className="text-sm font-medium text-foreground-muted">{t('sentBody')}</p>
                        <Link
                            href={`/messages?c=${chatId}`}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-8 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        >
                            {t('openChat')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm font-medium leading-relaxed text-foreground-muted">
                            {joining ? t('descriptionJoin') : t('description')}
                        </p>
                        <label htmlFor="contact-group-message" className="sr-only">{t('messageLabel')}</label>
                        <textarea
                            id="contact-group-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={MESSAGE_MAX_LENGTH}
                            rows={5}
                            placeholder={t('placeholder')}
                            className="w-full resize-none rounded-2xl border border-border bg-surface-elevated p-4 text-sm outline-none transition-all placeholder:text-foreground-muted/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                        />

                        {allowJoin && (
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-elevated/50 px-4 py-3">
                                <span id="contact-group-join-label" className="text-sm font-bold text-foreground">{t('joinSwitch')}</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={wantsToJoin}
                                    aria-labelledby="contact-group-join-label"
                                    onClick={() => setWantsToJoin(v => !v)}
                                    className={clsx(
                                        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                                        wantsToJoin ? 'bg-[var(--accent)]' : 'bg-border'
                                    )}
                                >
                                    <span className={clsx(
                                        'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                                        wantsToJoin && 'translate-x-5'
                                    )} />
                                </button>
                            </div>
                        )}

                        {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted transition-all hover:text-foreground disabled:opacity-50"
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-background shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isPending ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <>
                                        <Send className="h-3.5 w-3.5" />
                                        {joining ? t('sendJoin') : t('send')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
