'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { getGroupPosts, setPostArchived } from '@/actions/post-actions';
import { deletePostAction } from '@/actions/group-actions';
import { usePusher } from '@/hooks/usePusher';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { hasAdminRights } from '@/lib/utils/permissions';
import AnnouncementCard from '@/components/groups/AnnouncementCard';
import AnnouncementModal from '@/components/groups/AnnouncementModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { AnnouncementRow } from '@/lib/services/post.service';
import type { ErrorCode } from '@/types/actions';

type Props = {
    groupId: string;
    locale: string;
};

export default function AnnouncementBoard({ groupId, locale }: Props) {
    const { user } = useGroupContext();
    const canManage = hasAdminRights(user.role);
    const t = useTranslations('group');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const [posts, setPosts] = useState<AnnouncementRow[]>([]);
    const [error, setError] = useState<ErrorCode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isComposing, setIsComposing] = useState(false);
    const [toDelete, setToDelete] = useState<AnnouncementRow | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        const result = await getGroupPosts(groupId);
        if (result.success && result.data) setPosts(result.data);
        setIsLoading(false);
    }, [groupId]);

    useEffect(() => {
        let active = true;
        getGroupPosts(groupId).then(result => {
            if (!active) return;
            if (result.success && result.data) setPosts(result.data);
            setIsLoading(false);
        });
        return () => { active = false; };
    }, [groupId]);

    // The channel only carries ids; the list itself comes through the members-only action.
    usePusher<{ id: string }>(`group-${groupId}`, 'new-post', () => { void load(); });
    usePusher<{ id: string }>(`group-${groupId}`, 'archive-post', () => { void load(); });
    usePusher<{ postId: string }>(`group-${groupId}`, 'delete-post', ({ postId }) => {
        setPosts(current => current.filter(p => p.id !== postId));
    });

    const handleArchive = async (post: AnnouncementRow) => {
        if (busyId) return;
        setBusyId(post.id);
        setError(null);
        const result = await setPostArchived(post.id, post.archivedAt === null);
        if (result.success) await load();
        else setError(result.error);
        setBusyId(null);
    };

    const handleDelete = async () => {
        if (!toDelete || busyId) return;
        setBusyId(toDelete.id);
        setError(null);
        const result = await deletePostAction(toDelete.id, locale);
        if (result.success) {
            const removedId = toDelete.id;
            setPosts(current => current.filter(p => p.id !== removedId));
        } else {
            setError(result.error);
        }
        setToDelete(null);
        setBusyId(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const active = posts.filter(p => p.archivedAt === null);
    const archived = posts.filter(p => p.archivedAt !== null);
    const card = (post: AnnouncementRow) => (
        <AnnouncementCard
            key={post.id}
            post={post}
            canManage={canManage}
            busy={busyId !== null}
            onArchive={handleArchive}
            onDelete={setToDelete}
        />
    );

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {canManage && (
                <div className="mb-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsComposing(true)}
                        className="soft-press flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-white shadow-premium transition-opacity hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        {t('announcementNew')}
                    </button>
                </div>
            )}

            {error && (
                <p role="alert" className="mb-6 text-sm font-semibold text-red-500">{tErrors(error)}</p>
            )}

            {active.length > 0 ? (
                <div className="space-y-5">{active.map(card)}</div>
            ) : (
                <div className="py-12 text-center text-sm italic text-foreground-muted">
                    <p>{t('noAnnouncementsYet')}</p>
                    {canManage && <p className="mt-2">{t('announcementsTeamHint')}</p>}
                </div>
            )}

            {archived.length > 0 && (
                <details className="group/archive mt-10">
                    <summary className="cursor-pointer select-none text-sm font-bold text-foreground-muted transition-colors hover:text-foreground">
                        {t('announcementArchiveSection', { count: archived.length })}
                    </summary>
                    <div className="mt-5 space-y-5 opacity-90">{archived.map(card)}</div>
                </details>
            )}

            {isComposing && (
                <AnnouncementModal
                    groupId={groupId}
                    locale={locale}
                    onClose={() => setIsComposing(false)}
                    onPublished={() => { setIsComposing(false); void load(); }}
                />
            )}

            <ConfirmDialog
                isOpen={toDelete !== null}
                title={t('announcementDeleteTitle')}
                message={t('confirmDeletePost')}
                confirmLabel={tCommon('delete')}
                destructive
                isPending={busyId !== null}
                onConfirm={handleDelete}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
