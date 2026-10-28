'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Users, Ban, AlertCircle, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { sendMessage, blockConversation } from '@/actions/message-actions';
import { avatarUrl } from '@/lib/avatar';
import { Link } from '@/i18n/routing';
import { MESSAGE_MAX_LENGTH, messageTextSchema } from '@/lib/validations/message';
import type { InboxRow, MessageView } from '@/lib/services/message.service';
import GroupLabel from './GroupLabel';
import { useChatTimeline } from './useMessageTime';
import EmojiPicker from './EmojiPicker';
import { UI } from '@/lib/constants';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
export type ChatMessage = Omit<MessageView, 'createdAt'> & { createdAt: Date | string };

type Props = {
    conversation: InboxRow;
    messages: ChatMessage[];
    currentUserId: string;
    title: string;
    unknownName: string;
    onBack: () => void;
    onSent: (message: ChatMessage) => void;
    onBlockedChange: (isBlocked: boolean) => void;
    /** The back button also on wide screens (the drawer has no side list). */
    alwaysShowBack?: boolean;
};

export default function ChatPanel({ conversation, messages, currentUserId, title, unknownName, onBack, onSent, onBlockedChange, alwaysShowBack = false }: Props) {
    const t = useTranslations('messages');
    const tErrors = useTranslations('errors');
    const { time, dayKey, dayLabel } = useChatTimeline();
    const inputRef = useRef<HTMLInputElement>(null);
    const caretAfterEmoji = useRef<number | null>(null);
    const [draft, setDraft] = useState('');
    const counterId = useId();
    const [sendError, setSendError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
    const { error: toastError } = useToast();
    const listRef = useRef<HTMLDivElement>(null);

    // Always show the newest message: when a chat opens and whenever one arrives.
    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, conversation.id]);

    const over = isOverLimit(draft, MESSAGE_MAX_LENGTH);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageTextSchema.safeParse(draft).success || isPending || over) return;

        startTransition(async () => {
            const result = await sendMessage(conversation.id, draft);
            if (result.success && result.data) {
                onSent(result.data);
                setDraft('');
                setSendError(null);
            } else if (!result.success) {
                setSendError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    // Emoji go in at the caret (or the end when the field never had focus) and the caret stays after them.
    const insertEmoji = (emoji: string) => {
        const el = inputRef.current;
        const start = el?.selectionStart ?? draft.length;
        const end = el?.selectionEnd ?? draft.length;
        setDraft(draft.slice(0, start) + emoji + draft.slice(end));
        caretAfterEmoji.current = start + emoji.length;
    };

    // Once the new text is in the field: focus it and put the caret after the emoji.
    useEffect(() => {
        const caret = caretAfterEmoji.current;
        if (caret === null) return;
        caretAfterEmoji.current = null;
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(caret, caret);
    }, [draft]);

    const handleBlock = () => {
        if (isPending) return;
        const next = !conversation.isBlocked;
        startTransition(async () => {
            const result = await blockConversation(conversation.id, next);
            setBlockConfirmOpen(false);
            if (result.success) onBlockedChange(next);
            else toastError(t('blockFailed'));
        });
    };

    const origin = conversation.origin;
    const originKey = origin?.type === 'JOIN_REQUEST' ? 'originJoinRequest' : origin?.type === 'GROUP_CONTACT' ? 'originGroupContact' : null;

    return (
        <>
            <div className="z-10 flex items-center justify-between border-b border-border bg-surface p-4 max-md:pt-[calc(1rem+env(safe-area-inset-top))]">
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" className={clsx('-ml-2 p-2 text-foreground-muted', !alwaysShowBack && 'lg:hidden')} onClick={onBack} aria-label={t('back')}>
                        <ArrowLeft className="size-5" />
                    </button>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full line bg-surface">
                        {conversation.other
                            ? <img src={avatarUrl(conversation.other)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            : <Users className="size-4 text-foreground-muted" />}
                    </div>
                    <div className="min-w-0">
                        <span className="block truncate weight-strong">{title}</span>
                        {conversation.group && <GroupLabel group={conversation.group} showName={!conversation.viewerIsContact} className="text-meta" />}
                    </div>
                </div>

                {conversation.canBlock && (
                    <ConfirmPopover
                        isOpen={blockConfirmOpen}
                        onOpenChange={setBlockConfirmOpen}
                        message={t('confirmBlock')}
                        confirmLabel={conversation.isBlocked ? t('unblock') : t('block')}
                        destructive={!conversation.isBlocked}
                        isPending={isPending}
                        onConfirm={handleBlock}
                        renderTrigger={(trigger) => (
                            <button
                                {...trigger}
                                type="button"
                                className="flex items-center gap-2 rounded-pill bg-surface-elevated px-3 py-1.5 text-tag transition-colors hover:bg-surface-elevated/80"
                            >
                                <Ban className={clsx('size-3.5', conversation.isBlocked && 'text-danger')} />
                                {conversation.isBlocked ? t('unblock') : t('block')}
                            </button>
                        )}
                    />
                )}
            </div>

            <div ref={listRef} className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
                {originKey && origin && (
                    <p className="text-center text-meta text-foreground-muted">
                        {origin.groupName
                            ? t.rich(originKey, {
                                name: origin.groupName,
                                group: (chunks) => origin.groupHref ? (
                                    <Link href={origin.groupHref} className="weight-strong text-primary hover:underline">{chunks}</Link>
                                ) : (
                                    <span className="weight-strong">{chunks}</span>
                                )
                            })
                            : t(`${originKey}Gone`)}
                    </p>
                )}
                {messages.map((msg, i) => {
                    const prev = messages[i - 1];
                    const next = messages[i + 1];
                    const isMe = msg.senderId === currentUserId;
                    const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
                    const first = newDay || prev.senderId !== msg.senderId;
                    const last = !next || next.senderId !== msg.senderId || dayKey(next.createdAt) !== dayKey(msg.createdAt);
                    // In a group chat, say who is speaking once per run: the person, or a team member for the group.
                    const senderName = msg.sender.name || unknownName;
                    const speaker = first && !isMe && conversation.kind === 'GROUP'
                        ? (conversation.viewerIsContact && conversation.group ? `${senderName} · ${conversation.group.name}` : senderName)
                        : null;
                    return (
                        <div key={msg.id} className="contents">
                            {newDay && (
                                <p className="my-2 self-center rounded-pill bg-surface-elevated px-3 py-1 text-meta text-foreground-muted">{dayLabel(msg.createdAt)}</p>
                            )}
                            <div data-ui={UI.chatBubble} className={clsx('flex max-w-[75%] flex-col', isMe ? 'ml-auto items-end' : 'mr-auto items-start', first && !newDay && 'mt-3')}>
                                {speaker && <span className="mb-1 px-1 text-tag text-foreground-muted">{speaker}</span>}
                                <div className={clsx(
                                    'whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-body-sm',
                                    isMe
                                        ? 'bg-primary text-primary-foreground'
                                        : 'line bg-surface-elevated text-foreground shadow-control',
                                    last && (isMe ? 'rounded-br-none' : 'rounded-bl-none')
                                )}>
                                    {msg.content}
                                    <span className={clsx('float-right ml-3 mt-2 text-meta', isMe ? 'text-primary-foreground/80' : 'text-foreground-muted')}>{time(msg.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-border bg-surface p-4 max-md:pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {conversation.readOnly ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-elevated p-3 text-center text-body-sm text-foreground-muted">
                        <AlertCircle className="size-4" />
                        {t('groupGoneNote')}
                    </div>
                ) : conversation.isBlocked ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-danger/10 p-3 text-center text-body-sm text-danger">
                        <AlertCircle className="size-4" />
                        {t('conversationBlocked')}
                    </div>
                ) : (
                    <>
                        {sendError && <p role="alert" className="mb-2 text-tag text-danger">{sendError}</p>}
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <EmojiPicker onPick={insertEmoji} disabled={isPending} />
                            <Input
                                ref={inputRef}
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                aria-describedby={counterId}
                                placeholder={t('typeMessage')}
                                aria-label={t('typeMessage')}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={!messageTextSchema.safeParse(draft).success || isPending || over}
                                aria-label={t('send')}
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                        <div className="mt-1 flex items-start gap-2"><TextCounter id={counterId} length={draft.length} max={MESSAGE_MAX_LENGTH} /></div>
                    </>
                )}
            </div>
        </>
    );
}
