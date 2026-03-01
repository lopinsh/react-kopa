'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, HelpCircle } from 'lucide-react';
import { sendInquiry } from '@/actions/group-actions';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    accentColor: string;
};

export default function InquiryModal({ isOpen, onClose, groupId, groupName, accentColor }: Props) {
    const t = useTranslations('group');
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!message.trim()) {
            setError(t('messageRequired') || 'Message is required');
            return;
        }

        startTransition(async () => {
            const result = await sendInquiry(groupId, message);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setMessage('');
                }, 2000);
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                            {t('inquireTitle') || 'Reach Out'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-foreground-muted hover:bg-surface-elevated transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {success ? (
                    <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                            <Send className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('inquirySent') || 'Message Sent!'}</h3>
                        <p className="mt-2 text-sm text-foreground-muted">
                            {t('inquirySentDesc') || 'The admins have received your inquiry.'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <p className="text-sm text-foreground-muted leading-relaxed mb-4">
                                {t('inquiryDesc') || `Have questions for the admins of ${groupName}? Send them a message below.`}
                            </p>
                            <label htmlFor="inquiry-message" className="sr-only">
                                {t('message')}
                            </label>
                            <textarea
                                id="inquiry-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 transition-all outline-none resize-none"
                                style={{ '--accent': accentColor } as React.CSSProperties}
                                placeholder={t('typeMessageHere') || "I'd like to learn more about..."}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium">
                                {t(`error_${error.toLowerCase()}`) || error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                            style={{ backgroundColor: accentColor, boxShadow: `0 8px 16px ${accentColor}30` }}
                        >
                            {isPending ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    {t('sendInquiry') || 'Send Inquiry'}
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
