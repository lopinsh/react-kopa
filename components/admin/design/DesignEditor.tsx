'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { publishTheme, resetTheme, savePreviewTheme } from '@/actions/theme-actions';
import { useAdminFrame } from '@/components/admin/frame/AdminFrameProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { useThemeDraft } from '@/hooks/use-theme-draft';
import { DEFAULT_THEME_KEY, DESIGN_PARTS, type DesignPart, type ThemeMode, type ThemePresetKey } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';
import type { ActionResponse } from '@/types/actions';
import CategoryColorsEditor, { type ToneRow } from './CategoryColorsEditor';
import ColoursPart from './ColoursPart';
import DesignActions from './DesignActions';
import FontsPart from './FontsPart';
import LooksPart from './LooksPart';
import StylePart from './StylePart';
import ThemeSample from './ThemeSample';

type Pending = 'preview' | 'publish' | 'reset' | null;

/** Admin > Dizains: one draft shared by the five parts, previewed for yourself first, then published for everyone. */
export default function DesignEditor({ initial, initialPart, toneRows }: { initial: ThemeInput; initialPart: DesignPart; toneRows: ToneRow[] }) {
    const t = useTranslations('admin.design');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const { theme, issues, tonesEdited, choosePreset, setStyle, setColor, setTone, setFont } = useThemeDraft(initial);
    const param = useSearchParams().get('part');
    const part: DesignPart = (DESIGN_PARTS as readonly string[]).includes(param ?? '') ? (param as DesignPart) : initialPart;
    const [pending, setPending] = useState<Pending>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [sampleMode, setSampleMode] = useState<ThemeMode>('light');
    const [presetAsked, setPresetAsked] = useState<ThemePresetKey | null>(null);
    const [isTransition, startTransition] = useTransition();
    const busy = pending !== null || isTransition;
    const blockedParts = DESIGN_PARTS.filter((p) => issues.some((i) => i.part === p));
    const { setFlaggedParts } = useAdminFrame();
    const flaggedKey = blockedParts.join(',');
    useEffect(() => {
        setFlaggedParts(flaggedKey ? flaggedKey.split(',') : []);
        return () => setFlaggedParts([]);
    }, [flaggedKey, setFlaggedParts]);

    // A ready-made theme brings back the default tones, so edited tones are only dropped after the admin agrees.
    const askPreset = (key: ThemePresetKey) => (tonesEdited ? setPresetAsked(key) : choosePreset(key));

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

    const showPart = (p: DesignPart) => router.replace(`?part=${p}`, { scroll: false });

    return (
        <div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
                <div className="min-w-0">
                    {part === 'looks' && <LooksPart theme={theme} disabled={busy} onPreset={askPreset} />}
                    {part === 'colours' && <ColoursPart theme={theme} issues={issues} disabled={busy} onColor={setColor} />}
                    {part === 'style' && <StylePart theme={theme} disabled={busy} onStyle={setStyle} />}
                    {part === 'categories' && <CategoryColorsEditor rows={toneRows} theme={theme} disabled={busy} onTone={setTone} />}
                    {part === 'fonts' && <FontsPart theme={theme} disabled={busy} onFont={setFont} />}
                </div>
                <aside aria-labelledby="design-sample" className="lg:sticky lg:top-24">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 id="design-sample" className="text-base font-semibold text-foreground">{t('sampleTitle')}</h3>
                        <div role="group" aria-label={t('sampleMode')} className="flex rounded-pill bg-tint p-0.5">
                            {(['light', 'dark'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    aria-pressed={sampleMode === mode}
                                    onClick={() => setSampleMode(mode)}
                                    className={clsx('min-h-8 rounded-pill px-3 text-xs font-semibold', sampleMode === mode ? 'bg-primary text-primary-foreground' : 'text-foreground-muted')}
                                >
                                    {t(`mode.${mode}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ThemeSample tokens={theme[sampleMode]} headingFont={theme.headingFont} bodyFont={theme.bodyFont} styleKey={theme.styleKey} dark={sampleMode === 'dark'} />
                </aside>
            </div>
            <DesignActions
                busy={busy}
                blockedParts={blockedParts}
                onPreview={() => run('preview', () => savePreviewTheme(theme), 'previewSaved')}
                onPublish={() => run('publish', () => publishTheme(theme), 'published')}
                onReset={() => setConfirmReset(true)}
                onShowPart={showPart}
            />

            <ConfirmDialog
                isOpen={presetAsked !== null}
                title={t('resetTonesTitle')}
                message={t('resetTonesMessage')}
                confirmLabel={t('resetTonesConfirm')}
                onCancel={() => setPresetAsked(null)}
                onConfirm={() => {
                    if (presetAsked) choosePreset(presetAsked);
                    setPresetAsked(null);
                }}
            />
            <ConfirmDialog
                isOpen={confirmReset}
                title={t('resetConfirmTitle')}
                message={t('resetConfirmMessage')}
                confirmLabel={t('reset')}
                isPending={pending === 'reset'}
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => {
                    setConfirmReset(false);
                    choosePreset(DEFAULT_THEME_KEY);
                    run('reset', resetTheme, 'resetDone');
                }}
            />
        </div>
    );
}
