'use client';

import { useState, useTransition } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { deleteEvent } from '@/actions/event-actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Props = {
    eventId: string;
    locale: string;
    /** Path of the group, without locale: /l1/group/slug */
    groupPath: string;
    eventPath: string;
    /** Finished events can be deleted but not edited. */
    canEdit: boolean;
};

const BUTTON = 'inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground-muted transition-colors hover:text-foreground disabled:opacity-60';

/** Edit and delete for organisers. Delete asks first, then returns to the group's Events tab. */
export default function EventManageActions({ eventId, locale, groupPath, eventPath, canEdit }: Props) {
    const t = useTranslations('event');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    function handleDelete() {
        if (isPending) return;
        setError(null);
        startTransition(async () => {
            const result = await deleteEvent(eventId, locale);
            setConfirmOpen(false);
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.push(`${groupPath}/events`);
            router.refresh();
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
                <Link href={`${eventPath}/edit`} className={BUTTON}>
                    <Pencil className="h-3.5 w-3.5" />
                    {t('editEvent')}
                </Link>
            )}
            <button type="button" onClick={() => setConfirmOpen(true)} disabled={isPending} className={BUTTON}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {t('deleteEvent')}
            </button>
            <ConfirmDialog
                isOpen={confirmOpen}
                title={t('deleteEvent')}
                message={t('deleteConfirm')}
                confirmLabel={t('deleteEvent')}
                destructive
                isPending={isPending}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
            {error && (
                <p role="alert" className="w-full text-sm text-danger">
                    {tErrors(error as 'ACTION_FAILED')}
                </p>
            )}
        </div>
    );
}
