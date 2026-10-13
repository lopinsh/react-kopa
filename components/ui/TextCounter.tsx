'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import { limitState, type LimitState } from '@/lib/text-limit';

type Props = {
    /** id for the field's `aria-describedby`. */
    id: string;
    length: number;
    max: number;
    className?: string;
};

const TONE: Record<LimitState, string> = { ok: 'text-foreground-muted', near: 'font-semibold text-warning', over: 'font-semibold text-danger' };

/**
 * The count under a limited field, at its right end (AR-71): quiet, then the warning colour in the last tenth, then red with
 * "N too many" past the limit. The visible count is not a live region (it would speak on every key); a hidden one speaks
 * once when the state changes.
 */
export default function TextCounter({ id, length, max, className }: Props) {
    const t = useTranslations('common');
    const state = limitState(length, max);
    const over = length - max;
    const [spoken, setSpoken] = useState('');
    const left = max - length;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the hidden live region follows the state change
        setSpoken(state === 'near' ? t('counterNearSr', { left }) : state === 'over' ? t('counterOverSr', { over }) : '');
        // Only a change of state (or of the overshoot) is announced, not each key inside `near`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, state === 'over' ? over : 0]);

    return (
        <>
            <span id={id} data-ui={UI.fieldCounter} className={clsx('ml-auto shrink-0 text-xs tabular-nums', TONE[state], className)}>
                {state === 'over' ? t('counterOver', { count: length, max, over }) : t('counter', { count: length, max })}
            </span>
            <span className="sr-only" aria-live="polite">{spoken}</span>
        </>
    );
}
