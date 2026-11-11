'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { useToast } from '@/hooks/use-toast';
import { deleteHubNote, renewHubNote } from '@/actions/hub-note-actions';
import type { ActionResponse } from '@/types/actions';
import type { HubNoteRow } from '@/lib/services/hub-note.service';

/**
 * What a person may do with a Ziņa (§1): the author edits (active only), renews and deletes; a site admin deletes any. Others' notes show no
 * buttons yet: Atbildēt, "Rakstīt privāti" and Ziņot join here with K2-3 (replies and requests).
 */
export default function NoteActions({ note, onEdit }: { note: HubNoteRow; onEdit?: () => void }) {
    const t = useTranslations('hub.notes');
    const tErrors = useTranslations('errors');
    const { error: toastError } = useToast();
    const [confirm, setConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const run = (act: () => Promise<ActionResponse<void>>, after?: () => void) => {
        if (isPending) return;
        startTransition(async () => {
            const result = await act();
            after?.();
            if (!result.success) toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    if (!note.mine && !note.canDelete) return null;
    return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            {note.mine && !note.expired && onEdit && <Button size="sm" variant="quiet" disabled={isPending} onClick={onEdit}>{t('edit')}</Button>}
            {note.mine && <Button size="sm" variant="quiet" disabled={isPending} onClick={() => run(() => renewHubNote(note.id))}>{t('renew')}</Button>}
            {note.canDelete && (
                <ConfirmPopover
                    isOpen={confirm}
                    onOpenChange={setConfirm}
                    message={t('deleteConfirm')}
                    confirmLabel={t('delete')}
                    destructive
                    isPending={isPending}
                    onConfirm={() => run(() => deleteHubNote(note.id), () => setConfirm(false))}
                    renderTrigger={(trigger) => <Button {...trigger} size="sm" variant="quiet">{t('delete')}</Button>}
                />
            )}
        </div>
    );
}
