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
};

/** Restore / delete-permanently buttons for one row of the hidden-groups list. */
export default function HiddenGroupActions({ groupId, groupName }: Props) {
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
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
                >
                    <Undo2 className="h-4 w-4" />
                    {t('restoreShort')}
                </button>
                <button
                    onClick={() => setDeleteOpen(true)}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                    {t('deleteShort')}
                </button>
            </div>
            {error && <p role="alert" className="text-xs font-medium text-red-500">{error}</p>}
            <DeleteHiddenGroupModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                groupId={groupId}
                groupName={groupName}
            />
        </div>
    );
}
