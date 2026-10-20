'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, MoreHorizontal, Trash2 } from 'lucide-react';
import { setPostArchived } from '@/actions/post-actions';
import { deletePostAction } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MenuItemButton, MenuPanel, useMenu } from '@/components/ui/Menu';

const ICON = 'size-[17px] text-foreground-muted';

type Props = { postId: string; title: string; archived: boolean };

/** The "…" of one announcement for the team: archive or restore (undoable, no question), delete (asks, naming the post). */
export default function AnnouncementItemMenu({ postId, title, archived }: Props) {
    const t = useTranslations('group');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { error: toastError } = useToast();
    const { open, rootRef, triggerProps, menuProps } = useMenu();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isPending, startTransition] = useTransition();

    const run = (action: () => ReturnType<typeof deletePostAction>) => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            setConfirmDelete(false);
            if (res.success) router.refresh();
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <div className="relative flex" ref={rootRef}>
            <button
                {...triggerProps}
                aria-label={t('announcementActions')}
                disabled={isPending}
                className="grid size-11 place-items-center rounded-pill text-foreground-muted outline-none transition-colors hover:bg-tint focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
                <MoreHorizontal aria-hidden className="size-5" />
            </button>
            {open && (
                <MenuPanel label={t('announcementActions')} placement="anchor" {...menuProps}>
                    <MenuItemButton
                        icon={archived ? <ArchiveRestore aria-hidden className={ICON} /> : <Archive aria-hidden className={ICON} />}
                        onSelect={() => run(() => setPostArchived(postId, !archived, locale))}
                    >
                        {archived ? t('announcementRestore') : t('announcementArchive')}
                    </MenuItemButton>
                    <MenuItemButton icon={<Trash2 aria-hidden className={ICON} />} onSelect={() => setConfirmDelete(true)}>{c('delete')}</MenuItemButton>
                </MenuPanel>
            )}
            <ConfirmDialog
                isOpen={confirmDelete}
                title={t('announcementDeleteNamed', { title })}
                message={t('confirmDeletePost')}
                confirmLabel={c('delete')}
                destructive
                isPending={isPending}
                onConfirm={() => run(() => deletePostAction(postId, locale))}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
