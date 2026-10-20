'use client';

import { useId, useState, useTransition, type ReactNode, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import type { ZodType } from 'zod';
import Modal from '@/components/ui/Modal';
import { OverlayCloseButton } from '@/components/ui/overlay-support';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import { MODERATION_REASON_MAX } from '@/lib/validations/moderation';
import type { ActionResponse } from '@/types/actions';

type Props = {
    onClose: () => void;
    icon: ReactNode;
    title: string;
    /** Shown above the description, e.g. the name of the group. */
    subject?: string;
    description: string;
    reasonLabel: string;
    placeholder: string;
    hint: string;
    confirmLabel: string;
    cancelLabel: string;
    initialReason?: string;
    /** Same Zod schema the server action checks. */
    schema: ZodType<{ reason: string }>;
    /** Runs the server action; on success the modal closes. */
    onSubmit: (reason: string) => Promise<ActionResponse<unknown>>;
    onDone: () => void;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/** A red pop-up that asks a moderator or owner for a written reason, then runs one action with it. */
export default function ReasonModal({
    onClose, icon, title, subject, description, reasonLabel, placeholder, hint, confirmLabel, cancelLabel,
    initialReason = '', schema, onSubmit, onDone, returnFocusRef,
}: Props) {
    const tErrors = useTranslations('errors');
    const fieldId = useId();
    const [reason, setReason] = useState(initialReason);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const over = isOverLimit(reason, MODERATION_REASON_MAX);

    const handleSubmit = () => {
        if (isPending || over) return;
        if (!schema.safeParse({ reason }).success) {
            setError(tErrors('VALIDATION_FAILED'));
            return;
        }
        setError(null);
        startTransition(async () => {
            const res = await onSubmit(reason);
            if (res.success) {
                onDone();
                onClose();
            } else {
                setError(tErrors(res.error));
            }
        });
    };

    return (
        <Modal
            onClose={onClose}
            returnFocusRef={returnFocusRef}
            locked={isPending}
            dirty={reason !== initialReason}
            title={<span className="inline-flex items-center gap-2">{icon}{title}</span>}
        >
            {subject && <p className="mb-2 text-body-sm text-foreground [overflow-wrap:anywhere]">{subject}</p>}
            <p className="mb-4 text-body-sm text-foreground-muted">{description}</p>

            <label className="mb-1 block text-button-sm text-foreground" htmlFor={fieldId}>{reasonLabel}</label>
            <textarea
                id={fieldId}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-describedby={`${fieldId}-count`}
                rows={4}
                placeholder={placeholder}
                className="w-full resize-none rounded-xl line bg-surface-elevated px-4 py-3 text-body-sm text-foreground outline-none focus:border-danger/40"
            />
            <div className="mt-1 flex items-start gap-2">
                <p className="text-meta text-foreground-muted">{hint}</p>
                <TextCounter id={`${fieldId}-count`} length={reason.length} max={MODERATION_REASON_MAX} />
            </div>
            {error && <p role="alert" className="mt-2 text-body-sm text-danger">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
                <OverlayCloseButton
                    disabled={isPending}
                    className="rounded-xl px-5 py-2.5 text-body-sm text-foreground-muted hover:bg-surface-elevated transition-all disabled:opacity-50"
                >
                    {cancelLabel}
                </OverlayCloseButton>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending || over}
                    className="flex items-center gap-2 rounded-pill bg-danger px-5 py-2.5 text-button-sm text-danger-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
