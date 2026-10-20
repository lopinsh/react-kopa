'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { publishTheme, resetTheme, savePreviewTheme } from '@/actions/theme-actions';
import { useAdminFrame } from '@/components/admin/frame/AdminFrameProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { useThemeDraft } from '@/hooks/use-theme-draft';
import { DEFAULT_THEME_KEY, DESIGN_PARTS, type DesignPart, type ThemePresetKey } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';
import type { ActionResponse } from '@/types/actions';
import CategoryColorsEditor, { type ToneRow } from './CategoryColorsEditor';
import ColoursPart from './ColoursPart';
import DesignActions from './DesignActions';
import FontsPart from './FontsPart';

type Pending = 'preview' | 'publish' | 'reset' | null;

/** Admin > Dizains: one draft shared by the three parts, previewed for yourself first, then published for everyone. */
export default function DesignEditor({ initial, initialPart, toneRows }: { initial: ThemeInput; initialPart: DesignPart; toneRows: ToneRow[] }) {
    const t = useTranslations('admin.design');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const { theme, issues, tonesEdited, choosePreset, setColor, setTone, setFont } = useThemeDraft(initial);
    const param = useSearchParams().get('part');
    const part: DesignPart = (DESIGN_PARTS as readonly string[]).includes(param ?? '') ? (param as DesignPart) : initialPart;
    const [pending, setPending] = useState<Pending>(null);
    const [confirmReset, setConfirmReset] = useState(false);
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
            {part === 'colours' && <ColoursPart theme={theme} issues={issues} disabled={busy} onPreset={askPreset} onColor={setColor} />}
            {part === 'categories' && <CategoryColorsEditor rows={toneRows} theme={theme} disabled={busy} onTone={setTone} />}
            {part === 'fonts' && <FontsPart theme={theme} disabled={busy} onFont={setFont} />}
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
