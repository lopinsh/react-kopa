'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Send } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { chatLineSchema } from '@/lib/validations/chat';

const MAX_ROWS = 5;

export interface MentionCandidate { id: string; name: string }

const AT_RE = /(^|\s)@([^@\n]{0,30})$/;
const MAX_SUGGEST = 6;

/** The composer (K5-11): Enter sends, Shift+Enter breaks the line; the text stays when a send fails. `@` suggests names from `candidates` (K5-24, max 6, ↑↓ Enter). */
export default function ChatComposer({ onSend, candidates = [] }: { onSend: (text: string, mentions: string[]) => Promise<boolean>; candidates?: MentionCandidate[] }) {
    const t = useTranslations('hub.chat');
    const [text, setText] = useState('');
    const [isPending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);
    const field = useRef<HTMLTextAreaElement>(null);
    const [picked, setPicked] = useState<MentionCandidate[]>([]);
    const [at, setAt] = useState<string | null>(null);
    const [active, setActive] = useState(0);
    const suggestions = at === null ? [] : candidates.filter((c) => c.name.toLocaleLowerCase().startsWith(at.toLocaleLowerCase())).slice(0, MAX_SUGGEST);

    const look = (value: string, caret: number) => {
        setAt(AT_RE.exec(value.slice(0, caret))?.[2] ?? null);
        setActive(0);
    };
    const pick = (c: MentionCandidate) => {
        const el = field.current;
        const caret = el?.selectionStart ?? text.length;
        const before = text.slice(0, caret).replace(AT_RE, (_m, lead: string) => `${lead}@${c.name} `);
        setText(before + text.slice(caret));
        setPicked((p) => (p.some((x) => x.id === c.id) ? p : [...p, c]));
        setAt(null);
        el?.focus();
    };

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
        const ok = await onSend(parsed.data, picked.filter((c) => parsed.data.includes(`@${c.name}`)).map((c) => c.id));
        setPending(false);
        if (ok) {
            setText('');
            setPicked([]);
            setAt(null);
            requestAnimationFrame(grow);
        } else setFailed(true);
        field.current?.focus();
    };

    const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length);
                return;
            }
            if ((e.key === 'Enter' || e.key === 'Tab') && !e.nativeEvent.isComposing) {
                e.preventDefault();
                pick(suggestions[active] ?? suggestions[0]);
                return;
            }
            if (e.key === 'Escape') { setAt(null); return; }
        }
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void submit();
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="relative border-t border-border bg-surface p-3">
            {suggestions.length > 0 && (
                <ul role="listbox" aria-label={t('mention')} className="absolute inset-x-3 bottom-full mb-1 grid list-none rounded-xl bg-surface p-1 shadow-premium line">
                    {suggestions.map((c, i) => (
                        <li key={c.id} role="option" aria-selected={i === active}>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)} className={clsx('flex min-h-10 w-full items-center rounded-lg px-3 text-left text-body-sm text-foreground hover:bg-tint', i === active && 'bg-tint')}>@{c.name}</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex items-end gap-2">
                <Textarea ref={field} rows={1} value={text} maxLength={2000} placeholder={t('composer')} aria-label={t('composer')} aria-invalid={failed || undefined}
                    onChange={(e) => { setText(e.target.value); setFailed(false); grow(); look(e.target.value, e.target.selectionStart); }} onKeyDown={onKey} className="min-h-11 flex-1 resize-none md:min-h-10" />
                <IconButton type="submit" variant="primary" size="lg" aria-label={t('send')} disabled={isPending || text.trim() === ''}><Send aria-hidden className="size-5" /></IconButton>
            </div>
            {failed && <p role="alert" className="mt-2 text-meta text-danger">{t('sendFailed')}</p>}
        </form>
    );
}
