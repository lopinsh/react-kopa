'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Switch from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';
import type { ActionResponse } from '@/types/actions';

type Props = {
    label: string;
    description: string;
    checked: boolean;
    onSave: (next: boolean) => Promise<ActionResponse>;
    onSaved: () => void;
    /** The handbook UI elements page flips the switch without saving. */
    demo?: boolean;
    disabled?: boolean;
};

/** One Iestatījumi switch row: saves when changed, reverts with a toast when the save fails (OD-26). */
export default function SettingSwitchRow({ label, description, checked, onSave, onSaved, demo = false, disabled = false }: Props) {
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
            const save: Promise<ActionResponse> = demo ? Promise.resolve({ success: true }) : onSave(next);
            const result = await save.catch((): ActionResponse => ({ success: false, error: 'ACTION_FAILED' }));
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
        <div className="flex items-start gap-4 py-3">
            <div className="min-w-0 flex-1">
                <p id={`${id}-l`} className="text-body-sm">{label}</p>
                <p id={`${id}-d`} className="mt-0.5 text-meta text-foreground-muted">{description}</p>
            </div>
            <Switch checked={value} onChange={change} labelledBy={`${id}-l`} describedBy={`${id}-d`} disabled={isPending || disabled} className="mt-0.5" />
        </div>
    );
}
