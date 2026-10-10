'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useTranslations, useFormatter, useNow } from 'next-intl';
import { Send, Trash2 } from 'lucide-react';
import { createPost, getGroupPosts } from '@/actions/post-actions';
import { deletePostAction } from '@/actions/group-actions';
import { usePusher } from '@/hooks/usePusher';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { avatarUrl } from '@/lib/avatar';
import { hasAdminRights } from '@/lib/utils/permissions';
import { ANNOUNCEMENT_MAX_LENGTH } from '@/lib/validations/announcement';
import type { AnnouncementRow } from '@/lib/services/post.service';
import type { ErrorCode } from '@/types/actions';

type Props = {
    groupId: string;
    locale: string;
};

export default function AnnouncementBoard({ groupId, locale }: Props) {
    const { user } = useGroupContext();
    const canPost = hasAdminRights(user.role);
    const t = useTranslations('group');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const [posts, setPosts] = useState<AnnouncementRow[]>([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState<ErrorCode | null>(null);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    // The channel only carries the id; the list itself comes through the members-only action.
    usePusher<{ id: string }>(`group-${groupId}`, 'new-post', () => { void load(); });
    usePusher<{ postId: string }>(`group-${groupId}`, 'delete-post', ({ postId }) => {
        setPosts(current => current.filter(p => p.id !== postId));
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;
        setError(null);

        startTransition(async () => {
            const result = await createPost(groupId, content, locale);
            if (result.success) {
                setContent('');
                await load();
            } else {
                setError(result.error);
            }
        });
    };

    const handleDelete = async (postId: string) => {
        if (deletingId || !confirm(t('confirmDeletePost'))) return;
        setDeletingId(postId);
        setError(null);
        const result = await deletePostAction(postId, locale);
        if (result.success) {
            setPosts(current => current.filter(p => p.id !== postId));
        } else {
            setError(result.error);
        }
        setDeletingId(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {canPost && (
                <form onSubmit={handleSubmit} className="mb-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-premium transition-colors focus-within:border-primary">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('announcementPlaceholder')}
                        maxLength={ANNOUNCEMENT_MAX_LENGTH}
                        className="w-full resize-none border-none bg-transparent p-4 text-sm text-foreground focus:ring-0"
                        rows={3}
                    />
                    <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-elevated/50 px-4 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                            {content.length} / {ANNOUNCEMENT_MAX_LENGTH}
                        </span>
                        <button
                            type="submit"
                            disabled={!content.trim() || isPending}
                            className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    {t('announcementPublish')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <p role="alert" className="mb-6 text-sm font-semibold text-red-500">{tErrors(error)}</p>
            )}

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="group relative flex gap-4">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={avatarUrl(post.author)}
                                    alt={post.author.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="truncate text-sm font-bold text-foreground">
                                            {post.author.name || ''}
                                        </span>
                                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-tighter text-foreground-muted">
                                            {format.relativeTime(new Date(post.createdAt), now)}
                                        </span>
                                    </div>

                                    {canPost && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(post.id)}
                                            disabled={deletingId !== null}
                                            className="p-1 text-foreground-muted transition-opacity hover:text-red-500 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                                            title={tCommon('deletePost')}
                                            aria-label={tCommon('deletePost')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-none bg-surface-elevated p-4 text-sm leading-relaxed text-foreground shadow-card">
                                    {post.content}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-sm italic text-foreground-muted">
                        <p>{t('noAnnouncementsYet')}</p>
                        {canPost && <p className="mt-2">{t('announcementsTeamHint')}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
