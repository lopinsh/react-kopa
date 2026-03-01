'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X, User, Send, MessageSquare, History } from 'lucide-react';
import { manageMembership, sendApplicationInquiry } from '@/actions/group-actions';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { lv, enUS } from 'date-fns/locale';

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: { name: string | null; image: string | null };
}

type Props = {
    groupId: string;
    membershipId: string;
    targetUser: {
        id: string;
        name: string | null;
        image: string | null;
    };
    messages: Message[];
    locale: string;
};

export default function RequestCard({ groupId, membershipId, targetUser, messages, locale }: Props) {
    const t = useTranslations('group');
    const [isPending, startTransition] = useTransition();
    const [inquiryMode, setInquiryMode] = useState(false);
    const [inquiryText, setInquiryText] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const dateLocale = locale === 'lv' ? lv : enUS;

    const handleAction = (action: 'APPROVE' | 'DECLINE') => {
        startTransition(async () => {
            const result = await manageMembership(membershipId, action, locale);
            if (!result.success) {
                // We could add a toast here
                console.error(result.error);
            }
        });
    };

    const handleSendInquiry = () => {
        if (!inquiryText.trim()) return;
        startTransition(async () => {
            const result = await sendApplicationInquiry(groupId, targetUser.id, inquiryText, locale);
            if (result.success) {
                setInquiryText('');
                setInquiryMode(false);
                setShowHistory(true);
            } else {
                console.error(result.error);
            }
        });
    };

    return (
        <div className="flex flex-col p-5 rounded-3xl bg-surface-elevated/50 border border-border group/card hover:border-[var(--accent)]/30 transition-all shadow-card">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface relative shadow-inner">
                        {targetUser.image ? (
                            <img
                                src={targetUser.image}
                                alt={targetUser.name || ''}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <User className="h-6 w-6 text-foreground-muted" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="font-bold text-base text-foreground tracking-tight block truncate">
                            {targetUser.name || t('anonymousUser')}
                        </span>
                        <span className="text-[10px] font-black uppercase text-foreground-muted tracking-widest flex items-center gap-1.5">
                            <History className="h-3 w-3" />
                            {messages.length > 0 && formatDistanceToNow(new Date(messages[0].createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAction('APPROVE')}
                        disabled={isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white disabled:opacity-50 transition-all font-bold shadow-sm"
                        title={t('approve')}
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleAction('DECLINE')}
                        disabled={isPending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all font-bold shadow-sm"
                        title={t('decline')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Latest message preview or thread */}
            <div className="mt-4 pt-4 border-t border-border/50">
                {messages.length > 0 && !inquiryMode && !showHistory && (
                    <div className="relative p-4 rounded-2xl bg-surface border border-border/50 group/msg cursor-pointer" onClick={() => setShowHistory(true)}>
                        <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-2">
                            "{messages[messages.length - 1].content}"
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                            <MessageSquare className="h-3.5 w-3.5 text-foreground-muted" />
                        </div>
                    </div>
                )}

                {showHistory && (
                    <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
                        {messages.map((msg) => {
                            const isAdmin = msg.senderId !== targetUser.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={clsx(
                                        "flex flex-col gap-1 max-w-[85%]",
                                        isAdmin ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <div className={clsx(
                                        "px-4 py-2.5 rounded-2xl text-sm shadow-card",
                                        isAdmin
                                            ? "bg-[var(--accent)] text-white font-medium rounded-tr-none"
                                            : "bg-surface border border-border/50 text-foreground/90 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-foreground-muted px-1">
                                        {isAdmin ? t('role_admin') : targetUser.name || t('applicant')} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: dateLocale })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!inquiryMode ? (
                    <button
                        onClick={() => {
                            setInquiryMode(true);
                            setShowHistory(true);
                        }}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t('inquire')}
                    </button>
                ) : (
                    <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <textarea
                            value={inquiryText}
                            onChange={(e) => setInquiryText(e.target.value)}
                            placeholder={t('typeMessageHere')}
                            className="w-full bg-surface border border-border rounded-2xl p-4 text-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all placeholder:text-foreground-muted min-h-[100px] resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setInquiryMode(false)}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleSendInquiry}
                                disabled={isPending || !inquiryText.trim()}
                                className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-premium hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                <Send className="h-3 w-3" />
                                {t('sendInquiry')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
