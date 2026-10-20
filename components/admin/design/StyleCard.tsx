'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check, Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import type { ThemeStyleKey } from '@/lib/constants';
import { themeSampleVars } from '@/lib/theme/css';
import type { DraftTheme } from '@/hooks/use-theme-draft';

type Props = {
    styleKey: ThemeStyleKey;
    theme: DraftTheme;
    selected: boolean;
    disabled: boolean;
    onSelect: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

/** One style as a radio: a small specimen (card, button, chip, tag) in the current palette, its name and a hint. */
export default function StyleCard({ styleKey, theme, selected, disabled, onSelect, onKeyDown }: Props) {
    const t = useTranslations('admin.design');
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            className={clsx(
                'relative flex flex-col gap-3 rounded-2xl bg-surface p-4 text-left ring-inset disabled:opacity-60',
                selected ? 'ring-2 ring-primary' : 'ring-[length:var(--line-width)] ring-[color:var(--line-color)] hover:ring-foreground-muted'
            )}
        >
            {selected && <Check className="absolute right-3 top-3 h-5 w-5 text-primary" aria-hidden="true" />}
            <span
                aria-hidden="true"
                style={themeSampleVars(theme.light, theme.headingFont, theme.bodyFont, 'light', styleKey) as React.CSSProperties}
                className="block rounded-xl bg-background p-4 font-sans text-foreground"
            >
                <span className="line block rounded-xl bg-surface p-3 shadow-card">
                    <span className="block text-body">{t('styleSample.title')}</span>
                    <span className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-item cat-tile [--c:var(--primary)]"><Users className="size-4" /></span>
                        <span className={buttonClass('primary', '', 'sm')}>{t('styleSample.button')}</span>
                        <Badge>{t('styleSample.chip')}</Badge>
                        <Badge>{t('styleSample.tag')}</Badge>
                    </span>
                </span>
            </span>
            <span className="block">
                <span className="block text-body-sm text-foreground">{t(`styles.${styleKey}`)}</span>
                <span className="mt-0.5 block text-meta text-foreground-muted">{t(`styleHints.${styleKey}`)}</span>
            </span>
        </button>
    );
}
