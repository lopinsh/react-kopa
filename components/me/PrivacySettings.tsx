'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Switch from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';
import { updatePrivacy } from '@/actions/user-actions';
import type { PrivacySettings as Privacy } from '@/lib/types/profile';

const ROWS = [
    { key: 'isProfilePublic', label: 'publicProfile' },
    { key: 'allowDirectMessages', label: 'allowMessages' },
    { key: 'showGroupsOnProfile', label: 'showGroups' },
] as const;

type RowProps = { field: keyof Privacy; label: (typeof ROWS)[number]['label']; checked: boolean; onSaved: () => void; demo: boolean };

function Row({ field, label, checked, onSaved, demo }: RowProps) {
    const t = useTranslations('profile.settings.privacy');
    const tErrors = useTranslations('errors');
    const { error: toastError } = useToast();
    const id = useId();
    const [value, setValue] = useState(checked);
    const [isPending, startTransition] = useTransition();
    // A second click lands before the disabled state renders; the ref stops it from sending twice.
    const busy = useRef(false);

    const change = (next: boolean) => {
        if (isPending || busy.current) return;
        busy.current = true;
        setValue(next);
        startTransition(async () => {
            // Offline or a server crash rejects the call: revert and say so, like a failed save.
            const save = demo ? Promise.resolve({ success: true as const }) : updatePrivacy({ [field]: next });
            const result = await save.catch(() => ({ success: false as const, error: 'ACTION_FAILED' }));
            if (result.success) {
                onSaved();
            } else {
                setValue(!next);
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
            busy.current = false;
        });
    };

    return (
        <div className="flex items-start gap-4 py-2.5">
            <div className="min-w-0 flex-1">
                <p id={`${id}-l`} className="text-sm font-semibold">{t(label)}</p>
                <p id={`${id}-d`} className="mt-0.5 text-xs leading-relaxed text-foreground-muted">{t(`${label}Desc`)}</p>
            </div>
            <Switch checked={value} onChange={change} labelledBy={`${id}-l`} describedBy={`${id}-d`} disabled={isPending} className="mt-0.5" />
        </div>
    );
}

/** Privātums: who can open your profile, message you and see your groups. Each switch saves when you change it (OD-26).
 * `demo` (the handbook UI elements page) flips the switches without saving. */
export default function PrivacySettings({ initial, demo = false }: { initial: Privacy; demo?: boolean }) {
    const t = useTranslations('profile.settings');
    const [savedNote, setSavedNote] = useState(false);

    return (
        <fieldset id="privacy" className="scroll-mt-20 rounded-2xl bg-surface px-4 py-3.5 text-sm">
            <legend className="float-left mb-1.5 font-heading text-[15px] font-semibold">{t('privacy.title')}</legend>
            <div className="clear-both divide-y divide-border">
                {ROWS.map(({ key, label }) => (
                    <Row key={key} field={key} label={label} checked={initial[key]} onSaved={() => setSavedNote(true)} demo={demo} />
                ))}
            </div>
            <p role="status" aria-live="polite" className="sr-only">{savedNote ? t('saved') : ''}</p>
        </fieldset>
    );
}
