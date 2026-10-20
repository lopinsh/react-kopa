'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Undo2, Trash2 } from 'lucide-react';
import { restoreGroup } from '@/actions/moderation-actions';
import DeleteHiddenGroupModal from '@/components/modals/DeleteHiddenGroupModal';

type Props = {
    groupId: string;
    groupName: string;
    /** The reason the group was hidden with (pre-fills the delete reason). */
    hiddenReason?: string | null;
    /** Permanent delete is for the site owner only; admins can restore. */
    canDelete: boolean;
};

/** Restore / delete-permanently buttons for one row of the hidden-groups list. */
export default function HiddenGroupActions({ groupId, groupName, hiddenReason, canDelete }: Props) {
    const t = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRestore = () => {
        if (isPending) return;
        setError(null);
        startTransition(async () => {
            const res = await restoreGroup(groupId, locale);
            if (res.success) router.refresh();
            else setError(tErrors(res.error));
        });
    };

    return (
        <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleRestore}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg line bg-surface px-3 py-2 text-button-sm text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
                >
                    <Undo2 className="h-4 w-4" />
                    {t('restoreShort')}
                </button>
                {canDelete && (
                <button
                    onClick={() => setDeleteOpen(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-pill bg-danger px-3 py-2 text-button-sm text-danger-foreground transition-colors hover:opacity-90 disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    {t('deleteShort')}
                </button>
                )}
            </div>
            {error && <p role="alert" className="text-meta text-danger">{error}</p>}
            {canDelete && (
                <DeleteHiddenGroupModal
                    isOpen={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    groupId={groupId}
                    groupName={groupName}
                    initialReason={hiddenReason ?? ''}
                />
            )}
        </div>
    );
}
