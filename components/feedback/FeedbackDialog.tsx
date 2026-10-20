'use client';

import { useBackClose } from '@/hooks/useBackClose';
import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { clsx } from 'clsx';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import { createFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_KINDS, FEEDBACK_TEXT_MAX, type FeedbackKindValue } from '@/lib/constants';
import type { ElementLocator } from '@/lib/feedback/capture';
import type { FeedbackItem } from '@/lib/services/feedback.service';

export type FeedbackTarget = { selector: string; elementText: string; component: string | null; locator: ElementLocator };

type Props = {
    target: FeedbackTarget;
    /** Locale-less path of the page, including the query string. */
    path: string;
    onSaved: (note: FeedbackItem) => void;
    onClose: () => void;
};

/** The pop-up for a new note: pick a kind, write the text. Page, locale, size, theme and element are saved automatically. */
export default function FeedbackDialog({ target, path, onSaved, onClose }: Props) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { resolvedTheme } = useTheme();
    const [kind, setKind] = useState<FeedbackKindValue>('BUG');
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const requestClose = useBackClose(true, onClose, isPending);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            if (!isPending) requestClose();
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [isPending, requestClose]);

    const errorText = (code: string) => (tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const handleSave = () => {
        if (isPending || text.trim() === '' || isOverLimit(text, FEEDBACK_TEXT_MAX)) return;
        setError(null);
        startTransition(async () => {
            const res = await createFeedback({
                kind,
                text,
                path,
                locale,
                viewportW: window.innerWidth,
                viewportH: window.innerHeight,
                theme: resolvedTheme ?? 'light',
                selector: target.selector,
                elementText: target.elementText,
                component: target.component,
                ...target.locator,
                userAgent: navigator.userAgent.slice(0, 400),
            });
            if (res.success && res.data) onSaved(res.data);
            else setError(errorText(res.success ? 'ACTION_FAILED' : res.error));
        });
    };

    return (
        <div
            data-feedback-ignore
            className="fixed inset-0 z-[70] flex items-end justify-center bg-scrim p-4 sm:items-center sm:backdrop-blur-[1.5px]"
            onMouseDown={(e) => { if (e.target === e.currentTarget && !isPending) requestClose(); }}
        >
            <div role="dialog" aria-modal="true" aria-label={t('newTitle')} className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-2xl">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('newTitle')}</h2>
                {target.elementText && <p className="mt-1 truncate text-xs text-foreground-muted">{t('about', { text: target.elementText })}</p>}

                <div role="radiogroup" aria-label={t('kindLabel')} className="mt-4 flex flex-wrap gap-2">
                    {FEEDBACK_KINDS.map((k) => (
                        <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={kind === k}
                            onClick={() => setKind(k)}
                            className={clsx(
                                'rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors',
                                kind === k ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground-muted hover:text-foreground'
                            )}
                        >
                            {t(`kind.${k}`)}
                        </button>
                    ))}
                </div>

                <textarea
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-describedby="feedback-note-count"
                    rows={5}
                    placeholder={t('placeholder')}
                    aria-label={t('textLabel')}
                    className="mt-4 w-full resize-none rounded-xl line bg-surface-elevated p-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
                <div className="mt-1 flex items-start gap-2"><TextCounter id="feedback-note-count" length={text.length} max={FEEDBACK_TEXT_MAX} /></div>
                {error && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{error}</p>}

                <div className="mt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => requestClose()} disabled={isPending} className="rounded-xl px-4 py-2.5 text-sm font-bold text-foreground-muted hover:text-foreground disabled:opacity-50">
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending || text.trim() === '' || isOverLimit(text, FEEDBACK_TEXT_MAX)}
                        className="rounded-pill bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
