'use client';

import { useId, useState, useTransition, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { createReport } from '@/actions/report-actions';
import Button, { buttonClass } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { OverlayCloseButton } from '@/components/ui/overlay-support';
import { useToast } from '@/hooks/use-toast';
import { REPORT_REASONS, isReportReason } from '@/lib/constants';

type Props = {
    onClose: () => void;
    targetGroupId: string;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/** Reporting a group (OD-11: groups only for now): one reason from a short list, then "Nosūtīt". Mount = open. */
export default function ReportModal({ onClose, targetGroupId, returnFocusRef }: Props) {
    const t = useTranslations('report');
    const name = useId();
    const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
    const [isPending, startTransition] = useTransition();
    const { success, error: toastError } = useToast();

    const handleSubmit = () => {
        if (isPending || !isReportReason(reason)) return;
        startTransition(async () => {
            const res = await createReport({ targetGroupId, reason });
            if (res.success) {
                onClose();
                success(t('success'));
            } else {
                toastError(t('error'));
            }
        });
    };

    return (
        <Modal onClose={onClose} returnFocusRef={returnFocusRef} locked={isPending} title={t('title')}>
            <p className="text-sm leading-relaxed text-foreground-muted">{t('description')}</p>

            <fieldset className="mt-3 flex flex-col gap-0.5">
                <legend className="sr-only">{t('reasonLabel')}</legend>
                {REPORT_REASONS.map((value) => (
                    <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-foreground hover:bg-tint">
                        <input
                            type="radio"
                            name={name}
                            value={value}
                            checked={reason === value}
                            onChange={() => setReason(value)}
                            className="size-4 shrink-0 accent-primary"
                        />
                        {t(`reason${value}`)}
                    </label>
                ))}
            </fieldset>

            <div className="mt-4 flex items-center justify-end gap-2.5">
                <OverlayCloseButton disabled={isPending} className={buttonClass('secondary')}>{t('cancel')}</OverlayCloseButton>
                <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
                    {t('submit')}
                </Button>
            </div>
        </Modal>
    );
}
