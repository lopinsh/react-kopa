'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Smile } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { useClickOutside } from '@/hooks/useClickOutside';
import { CHAT_EMOJI } from '@/lib/constants';

const COLUMNS = 6;

/** The emoji button of the chat input and its small popover. Arrow keys move over the grid, Enter/Space picks, Esc closes and returns to the button. */
export default function EmojiPicker({ onPick, disabled }: { onPick: (emoji: string) => void; disabled?: boolean }) {
    const t = useTranslations('messages');
    const [open, setOpen] = useState(false);
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useClickOutside(rootRef, () => setOpen(false), open);

    useEffect(() => {
        if (open) gridRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, [open]);

    const close = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('button') ?? []);
        const at = items.indexOf(document.activeElement as HTMLElement);
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? COLUMNS : e.key === 'ArrowUp' ? -COLUMNS : 0;
        if (step) {
            e.preventDefault();
            const next = at + step;
            if (next >= 0 && next < items.length) items[next].focus();
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'Tab') setOpen(false);
    };

    return (
        <div className="relative flex shrink-0" ref={rootRef}>
            <IconButton
                ref={triggerRef}
                size="lg"
                disabled={disabled}
                aria-label={t('emoji')}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                onClick={() => setOpen((o) => !o)}
            >
                <Smile aria-hidden className="size-5" />
            </IconButton>
            {open && (
                <div
                    id={id}
                    role="dialog"
                    aria-label={t('emoji')}
                    onKeyDown={onKeyDown}
                    className="absolute bottom-full left-0 z-50 mb-2 w-max max-w-[calc(100vw-2rem)] rounded-menu line bg-surface p-2 shadow-premium"
                >
                    <div ref={gridRef} className="grid grid-cols-6 gap-1">
                        {CHAT_EMOJI.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => { onPick(emoji); close(); }}
                                className="flex size-10 items-center justify-center rounded-item text-title hover:bg-tint focus-visible:bg-tint focus-visible:outline-2 focus-visible:outline-primary"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
