'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { publishTheme, resetTheme, savePreviewTheme } from '@/actions/theme-actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import {
    THEME_EDITABLE_TOKENS, THEME_FONTS, THEME_PRESETS, THEME_PRESET_KEYS,
    type ThemeEditableToken, type ThemeFontId, type ThemeKey,
} from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';
import type { ActionResponse } from '@/types/actions';
import ColorField from './ColorField';
import ThemePresetCard from './ThemePresetCard';
import ThemeSample from './ThemeSample';

type Mode = 'light' | 'dark';
type Pending = 'preview' | 'publish' | 'reset' | null;

const SELECT = 'mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground';

/** Admin > Design: pick a preset or edit by hand, see it in the sample, save a private preview, publish for everyone. */
export default function DesignEditor({ initial }: { initial: ThemeInput }) {
    const t = useTranslations('admin.design');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [theme, setTheme] = useState<ThemeInput>(initial);
    const [sampleMode, setSampleMode] = useState<Mode>('light');
    const [pending, setPending] = useState<Pending>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [isTransition, startTransition] = useTransition();
    const busy = pending !== null || isTransition;

    const choosePreset = (key: ThemeKey) => {
        if (key === 'custom') return;
        const p = THEME_PRESETS[key];
        setTheme({ presetKey: key, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont });
    };

    const setColor = (mode: Mode, token: ThemeEditableToken, hex: string) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [mode]: { ...prev[mode], [token]: hex } }));

    const setFont = (which: 'headingFont' | 'bodyFont', id: ThemeFontId) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [which]: id }));

    const run = (kind: Exclude<Pending, null>, action: () => Promise<ActionResponse>, doneKey: 'previewSaved' | 'published' | 'resetDone') => {
        if (busy) return;
        setPending(kind);
        startTransition(async () => {
            const res = await action();
            setPending(null);
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <div className="space-y-8">
            <section aria-labelledby="design-presets">
                <h2 id="design-presets" className="mb-3 text-lg font-bold text-foreground">{t('presetsTitle')}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {THEME_PRESET_KEYS.map((key) => (
                        <ThemePresetCard key={key} presetKey={key} selected={theme.presetKey === key} disabled={busy} onSelect={() => choosePreset(key)} />
                    ))}
                </div>
                {theme.presetKey === 'custom' && <p className="mt-3 text-sm font-semibold text-primary">{t('customActive')}</p>}
            </section>

            <section aria-labelledby="design-custom">
                <h2 id="design-custom" className="mb-1 text-lg font-bold text-foreground">{t('customTitle')}</h2>
                <p className="mb-4 text-sm text-foreground-muted">{t('customHint')}</p>
                <div className="grid gap-4 lg:grid-cols-2">
                    {(['light', 'dark'] as const).map((mode) => (
                        <fieldset key={mode} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                            <legend className="px-2 text-sm font-bold text-foreground">{t(`mode.${mode}`)}</legend>
                            {THEME_EDITABLE_TOKENS.map((token) => (
                                <ColorField key={token} label={t(`token.${token}`)} value={theme[mode][token]} disabled={busy} onChange={(hex) => setColor(mode, token, hex)} />
                            ))}
                        </fieldset>
                    ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-foreground">
                        {t('headingFont')}
                        <select value={theme.headingFont} disabled={busy} onChange={(e) => setFont('headingFont', e.target.value as ThemeFontId)} className={SELECT}>
                            {THEME_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-foreground">
                        {t('bodyFont')}
                        <select value={theme.bodyFont} disabled={busy} onChange={(e) => setFont('bodyFont', e.target.value as ThemeFontId)} className={SELECT}>
                            {THEME_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                    </label>
                </div>
            </section>

            <section aria-labelledby="design-sample">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 id="design-sample" className="text-lg font-bold text-foreground">{t('sampleTitle')}</h2>
                    <div role="group" aria-label={t('sampleMode')} className="flex rounded-xl border border-border p-0.5">
                        {(['light', 'dark'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                aria-pressed={sampleMode === mode}
                                onClick={() => setSampleMode(mode)}
                                className={clsx('rounded-lg px-3 py-1 text-xs font-bold', sampleMode === mode ? 'bg-primary text-primary-foreground' : 'text-foreground-muted')}
                            >
                                {t(`mode.${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <ThemeSample tokens={theme[sampleMode]} headingFont={theme.headingFont} bodyFont={theme.bodyFont} dark={sampleMode === 'dark'} />
            </section>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => run('preview', () => savePreviewTheme(theme), 'previewSaved')}
                    className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-elevated disabled:opacity-50"
                >
                    {t('savePreview')}
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => run('publish', () => publishTheme(theme), 'published')}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                    {t('publish')}
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmReset(true)}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-foreground-muted hover:text-foreground disabled:opacity-50 sm:ml-auto"
                >
                    {t('reset')}
                </button>
            </div>
            <p className="text-xs text-foreground-muted">{t('previewHint')}</p>

            <ConfirmDialog
                isOpen={confirmReset}
                title={t('resetConfirmTitle')}
                message={t('resetConfirmMessage')}
                confirmLabel={t('reset')}
                isPending={pending === 'reset'}
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => {
                    setConfirmReset(false);
                    choosePreset('current');
                    run('reset', resetTheme, 'resetDone');
                }}
            />
        </div>
    );
}
