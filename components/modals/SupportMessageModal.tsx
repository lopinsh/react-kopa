'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Send, X, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendInquiry } from '@/actions/group-actions';
import { clsx } from 'clsx';

const schema = z.object({
    message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
    accentColor: string;
};

export default function SupportMessageModal({ isOpen, onClose, groupId, groupName, accentColor }: Props) {
    const t = useTranslations('group');
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    });

    if (!isOpen) return null;

    const onSubmit = async (data: any) => {
        setIsPending(true);
        setError(null);
        try {
            const result = await sendInquiry(groupId, data.message);
            if (result.success) {
                setIsSent(true);
                reset();
            } else {
                setError(result.error || 'Failed to send message');
            }
        } catch (e) {
            setError('Something went wrong');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-surface p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]" style={{ '--accent': accentColor } as any}>
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{t('messageAdmins')}</h2>
                            <p className="text-xs text-foreground-muted">{groupName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-foreground-muted hover:bg-surface-secondary hover:text-foreground transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isSent ? (
                        <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                                <Send className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{t('messageSent')}</h3>
                            <p className="mt-2 text-foreground-muted">{t('messageSuccess')}</p>
                            <button
                                onClick={onClose}
                                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-8 font-bold text-background transition-all hover:bg-foreground/90 active:scale-95"
                            >
                                {t('close')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-500/80">
                                {t('messageWarning')}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    {t('yourMessageLabel')}
                                </label>
                                <textarea
                                    {...register('message')}
                                    placeholder={t('messagePlaceholder')}
                                    className={clsx(
                                        "w-full min-h-[150px] rounded-xl border bg-surface p-4 text-sm text-foreground outline-none transition-all focus:ring-2",
                                        errors.message ? "border-red-500 focus:ring-red-500/20" : "border-border focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                                    )}
                                    style={{ '--accent': accentColor } as any}
                                />
                                {errors.message && (
                                    <p className="mt-1.5 text-xs font-medium text-red-500">
                                        {errors.message.message as string}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl border border-border text-sm font-bold text-foreground-muted transition-all hover:bg-surface active:scale-95"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                                    style={{
                                        backgroundColor: accentColor,
                                        color: 'white',
                                        boxShadow: `0 4px 14px ${accentColor}40`
                                    }}
                                >
                                    {isPending ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            {t('sendMessage')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
