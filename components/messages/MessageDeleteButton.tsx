'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { deleteMessage } from '@/actions/message-actions';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { IconButton } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

type Props = { messageId: string; onDeleted: () => void };

/** "Dzēst" on a message you sent: asks at the button, then both sides see "Ziņa izdzēsta" in its place. */
export default function MessageDeleteButton({ messageId, onDeleted }: Props) {
    const t = useTranslations('messages');
    const tErrors = useTranslations('errors');
    const { error: toastError } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const confirm = () => {
        if (isPending) return;
        startTransition(async () => {
            const result = await deleteMessage(messageId);
            setOpen(false);
            if (result.success) onDeleted();
            else toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <ConfirmPopover
            isOpen={open}
            onOpenChange={setOpen}
            message={t('confirmDeleteMessage')}
            confirmLabel={t('deleteMessage')}
            destructive
            isPending={isPending}
            onConfirm={confirm}
            renderTrigger={(trigger) => (
                <IconButton {...trigger} size="xs" aria-label={t('deleteMessage')}>
                    <Trash2 aria-hidden className="size-3.5" />
                </IconButton>
            )}
        />
    );
}
