'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Trash2, User as UserIcon, LogIn } from 'lucide-react';
import { createPost, getGroupPosts } from '@/actions/post-actions';
import { deletePostAction as deletePost } from '@/actions/group-actions';
import { clsx } from 'clsx';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { lv, enUS } from 'date-fns/locale';
import { useAuthGate } from '@/lib/useAuthGate';
import AuthGateModal from '@/components/modals/AuthGateModal';

type Post = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

type Props = {
    groupId: string;
    locale: string;
    currentUserId?: string;
    isMember: boolean;
    userRole: string | null;
};

export default function DiscussionBoard({ groupId, locale, currentUserId, isMember, userRole }: Props) {
    const t = useTranslations('group');
    const tAuth = useTranslations('auth');
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const { gateAction, isModalOpen, closeModal, isAuthenticated } = useAuthGate();

    const dateLocale = locale === 'lv' ? lv : enUS;

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await getGroupPosts(groupId);
            setPosts(data as Post[]);
            setIsLoading(false);
        };
        fetchPosts();

        const { pusherClient } = require('@/lib/pusher');
        const channelName = `group-${groupId}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind('new-post', (post: Post) => {
            setPosts((currentPosts) => {
                // Prevent duplicate posts if this client created it (relies on ID check)
                if (currentPosts.some(p => p.id === post.id)) return currentPosts;
                return [post, ...currentPosts];
            });
        });

        channel.bind('delete-post', ({ postId }: { postId: string }) => {
            setPosts((current) => current.filter(p => p.id !== postId));
        });

        return () => {
            pusherClient.unsubscribe(channelName);
            channel.unbind_all();
        };
    }, [groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isPending) return;

        startTransition(async () => {
            const result = await createPost(groupId, content, locale);
            if (result.success && result.post) {
                // Manually add current userId if missing in result author object to satisfy Post type
                const postWithId = {
                    ...result.post,
                    author: { ...result.post.author, id: currentUserId! }
                };
                setPosts([postWithId as unknown as Post, ...posts]);
                setContent('');
            }
        });
    };

    const handleDelete = async (postId: string) => {
        if (!confirm(t('confirmDeletePost'))) return;

        const result = await deletePost(postId, locale);
        if (result.success) {
            setPosts(posts.filter(p => p.id !== postId));
        }
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
            {/* Post Input */}
            {isMember ? (
                <form onSubmit={handleSubmit} className="mb-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-premium focus-within:border-primary transition-colors">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('postPlaceholder')}
                        className="w-full resize-none border-none bg-transparent p-4 text-sm text-foreground focus:ring-0"
                        rows={3}
                    />
                    <div className="flex items-center justify-between border-t border-border bg-surface-elevated/50 px-4 py-2">
                        <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-bold">
                            {content.length} / 2000
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
                                    {t('postButton')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : !isAuthenticated ? (
                <div className="mb-10 rounded-2xl border border-dashed border-border bg-surface-elevated/30 p-8 text-center">
                    <button
                        onClick={() => gateAction(() => { })}
                        className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-primary hover:underline transition-colors"
                    >
                        <LogIn className="h-4 w-4" />
                        {tAuth('signInToParticipate')}
                    </button>
                </div>
            ) : (
                <div className="mb-10 rounded-2xl border border-dashed border-border bg-surface-elevated/30 p-8 text-center">
                    <p className="text-sm text-foreground-muted">{t('joinToDiscuss')}</p>
                </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="group relative flex gap-4">
                            {/* Avatar */}
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
                                {post.author.image ? (
                                    <img
                                        src={post.author.image || undefined}
                                        alt={post.author.name || ''}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-foreground-muted" />
                                    </div>
                                )}
                            </div>

                            {/* Content Bubble */}
                            <div className="flex flex-1 flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-foreground">
                                            {post.author.name || 'User'}
                                        </span>
                                        <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-tighter">
                                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateLocale })}
                                        </span>
                                    </div>

                                    {(currentUserId === post.author.id || userRole === 'OWNER' || userRole === 'ADMIN') && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-foreground-muted hover:text-red-500"
                                            title={t('deletePost')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="rounded-2xl rounded-tl-none bg-surface-elevated p-4 text-sm leading-relaxed text-foreground shadow-card">
                                    {post.content}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-foreground-muted italic text-sm">
                        {t('noPostsYet')}
                    </div>
                )}
            </div>
            <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
}
