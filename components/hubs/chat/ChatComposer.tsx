'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { chatLineSchema } from '@/lib/validations/chat';

const MAX_ROWS = 5;

/** The composer (K5-11): Enter sends, Shift+Enter breaks the line; the text stays when a send fails. */
export default function ChatComposer({ onSend }: { onSend: (text: string) => Promise<boolean> }) {
    const t = useTranslations('hub.chat');
    const [text, setText] = useState('');
    const [isPending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);
    const field = useRef<HTMLTextAreaElement>(null);

    const grow = () => {
        const el = field.current;
        if (!el) return;
        el.style.height = 'auto';
        const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
        el.style.height = `${Math.min(el.scrollHeight, line * MAX_ROWS + 16)}px`;
    };

    const submit = async () => {
        const parsed = chatLineSchema.safeParse(text);
        if (!parsed.success || isPending) return;
        setPending(true);
        setFailed(false);
        const ok = await onSend(parsed.data);
        setPending(false);
        if (ok) {
            setText('');
            requestAnimationFrame(grow);
        } else setFailed(true);
        field.current?.focus();
    };

    const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void submit();
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="border-t border-border bg-surface p-3">
            <div className="flex items-end gap-2">
                <Textarea ref={field} rows={1} value={text} maxLength={2000} placeholder={t('composer')} aria-label={t('composer')} aria-invalid={failed || undefined}
                    onChange={(e) => { setText(e.target.value); setFailed(false); grow(); }} onKeyDown={onKey} className="min-h-11 flex-1 resize-none md:min-h-10" />
                <IconButton type="submit" variant="primary" size="lg" aria-label={t('send')} disabled={isPending || text.trim() === ''}><Send aria-hidden className="size-5" /></IconButton>
            </div>
            {failed && <p role="alert" className="mt-2 text-meta text-danger">{t('sendFailed')}</p>}
        </form>
    );
}
