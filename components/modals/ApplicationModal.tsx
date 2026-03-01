'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { joinGroup } from '@/actions/group-actions';
import { X, Send } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    locale: string;
};

export default function ApplicationModal({ isOpen, onClose, groupId, groupName, locale }: Props) {
    const t = useTranslations('group');
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!message.trim()) return;

        startTransition(async () => {
            const result = await joinGroup(groupId, locale, message);
            if (result.success) {
                onClose();
            } else {
                console.error(result.error);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg rounded-[2rem] bg-surface p-8 shadow-2xl border border-border/50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                        {t('applyToGroup', { name: groupName })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-foreground-muted hover:bg-surface-elevated hover:text-foreground transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-foreground-muted leading-relaxed font-medium">
                        {t('applyDescription')}
                    </p>

                    <div className="relative group">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('applyPlaceholder')}
                            rows={5}
                            className="w-full resize-none rounded-2xl border border-border bg-surface-elevated p-5 text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-foreground-muted/50"
                        />
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                    <div className="sr-only" aria-live="polite" role="status">
                        {isPending ? 'Sending...' : ''}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted hover:text-foreground transition-all disabled:opacity-50"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !message.trim()}
                        className={clsx(
                            "flex items-center gap-2 rounded-xl bg-foreground px-7 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-background shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
                        )}
                    >
                        {isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                {t('sendApplication')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
