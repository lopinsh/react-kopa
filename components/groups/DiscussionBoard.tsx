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
import { useGroupContext } from '@/components/providers/GroupProvider';

type NestedReply = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

type Reply = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    replies: NestedReply[];
};

type Post = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    replies: Reply[];
};

type Props = {
    groupId: string;
    locale: string;
    currentUserId?: string;
};

export default function DiscussionBoard({ groupId, locale, currentUserId }: Props) {
    const { isMember, userRole } = useGroupContext();
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const tAuth = useTranslations('auth');
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState<Record<string, string>>({});
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const { gateAction, isModalOpen, closeModal, isAuthenticated } = useAuthGate();

    const dateLocale = locale === 'lv' ? lv : enUS;

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await getGroupPosts(groupId);
            if (data && Array.isArray(data)) {
                setPosts(data as Post[]);
            } else {
                setPosts([]);
            }
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
                return [{ ...post, replies: [] }, ...currentPosts];
            });
        });

        channel.bind('new-reply', (reply: Reply & { parentId: string } | NestedReply & { parentId: string }) => {
            setPosts((currentPosts) => {
                return currentPosts.map(post => {
                    // Is it a reply to the main post?
                    if (post.id === reply.parentId) {
                        if (post.replies.some(r => r.id === reply.id)) return post;
                        return { ...post, replies: [...post.replies, { ...reply, replies: [] } as Reply] };
                    }

                    // Is it a reply to a reply? (Level 2)
                    const updatedReplies = post.replies.map(r => {
                        if (r.id === reply.parentId) {
                            if (r.replies.some(nr => nr.id === reply.id)) return r;
                            return { ...r, replies: [...r.replies, reply as NestedReply] };
                        }
                        return r;
                    });

                    return { ...post, replies: updatedReplies };
                });
            });
        });

        channel.bind('delete-post', ({ postId }: { postId: string }) => {
            setPosts((current) => {
                // Remove if it's a top-level post
                const filteredPosts = current.filter(p => p.id !== postId);
                if (filteredPosts.length !== current.length) return filteredPosts;

                // Remove if it's a reply
                return current.map(post => ({
                    ...post,
                    replies: post.replies.filter(r => r.id !== postId).map(r => ({
                        ...r,
                        replies: r.replies.filter(nr => nr.id !== postId)
                    }))
                }));
            });
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
            if (result.success && result.data?.post) {
                const postWithId = {
                    ...result.data.post,
                    author: { ...result.data.post.author, id: currentUserId! }
                };
                setPosts([postWithId as unknown as Post, ...posts]);
                setContent('');
            }
        });
    };

    const handleReply = async (e: React.FormEvent, parentId: string) => {
        e.preventDefault();
        const rContent = replyContent[parentId];
        if (!rContent?.trim() || isPending) return;

        startTransition(async () => {
            const result = await createPost(groupId, rContent, locale, parentId);
            if (result.success && result.data?.post) {
                const newReply = {
                    ...result.data.post,
                    author: { ...result.data.post.author, id: currentUserId! }
                };

                setPosts(posts.map(p => {
                    if (p.id === parentId) {
                        return { ...p, replies: [...p.replies, { ...newReply, replies: [] } as Reply] };
                    }

                    const updatedReplies = p.replies.map(r => {
                        if (r.id === parentId) {
                            return { ...r, replies: [...r.replies, newReply as NestedReply] };
                        }
                        return r;
                    });

                    return { ...p, replies: updatedReplies };
                }));

                setReplyContent(prev => ({ ...prev, [parentId]: '' }));
                setActiveReplyId(null);
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
                                            title={c_common('deletePost')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="rounded-2xl rounded-tl-none bg-surface-elevated p-4 text-sm leading-relaxed text-foreground shadow-card">
                                    {post.content}
                                </div>

                                <div className="mt-2 flex items-center gap-4">
                                    <button
                                        onClick={() => gateAction(() => setActiveReplyId(activeReplyId === post.id ? null : post.id))}
                                        className="text-xs font-bold text-foreground-muted hover:text-primary transition-colors"
                                    >
                                        {t('reply')}
                                    </button>
                                </div>

                                {activeReplyId === post.id && isMember && (
                                    <form onSubmit={(e) => handleReply(e, post.id)} className="mt-3 flex gap-2">
                                        <input
                                            type="text"
                                            value={replyContent[post.id] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                                            placeholder={t('replyPlaceholder')}
                                            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm focus:border-primary focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyContent[post.id]?.trim() || isPending}
                                            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                )}

                                {/* Replies list */}
                                {post.replies && post.replies.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-4 border-l-2 border-border pl-4">
                                        {post.replies.map((reply) => (
                                            <div key={reply.id} className="group/reply relative flex gap-3">
                                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
                                                    {reply.author.image ? (
                                                        <img
                                                            src={reply.author.image || undefined}
                                                            alt={reply.author.name || ''}
                                                            className="h-full w-full object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <UserIcon className="h-4 w-4 text-foreground-muted" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-foreground">
                                                                {reply.author.name || 'User'}
                                                            </span>
                                                            <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-tighter">
                                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: dateLocale })}
                                                            </span>
                                                        </div>
                                                        {(currentUserId === reply.author.id || userRole === 'OWNER' || userRole === 'ADMIN') && (
                                                            <button
                                                                onClick={() => handleDelete(reply.id)}
                                                                className="opacity-0 group-hover/reply:opacity-100 transition-opacity p-1 text-foreground-muted hover:text-red-500"
                                                                title={c_common('deletePost')}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="rounded-2xl rounded-tl-none bg-surface-elevated/50 p-3 text-sm leading-relaxed text-foreground">
                                                        {reply.content}
                                                    </div>

                                                    <div className="mt-1 flex items-center gap-4">
                                                        <button
                                                            onClick={() => gateAction(() => setActiveReplyId(activeReplyId === reply.id ? null : reply.id))}
                                                            className="text-[10px] font-bold text-foreground-muted hover:text-primary transition-colors"
                                                        >
                                                            {t('reply')}
                                                        </button>
                                                    </div>

                                                    {activeReplyId === reply.id && isMember && (
                                                        <form onSubmit={(e) => handleReply(e, reply.id)} className="mt-2 flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={replyContent[reply.id] || ''}
                                                                onChange={(e) => setReplyContent({ ...replyContent, [reply.id]: e.target.value })}
                                                                placeholder={t('replyPlaceholder')}
                                                                className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                                                            />
                                                            <button
                                                                type="submit"
                                                                disabled={!replyContent[reply.id]?.trim() || isPending}
                                                                className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                                            >
                                                                <Send className="h-3 w-3" />
                                                            </button>
                                                        </form>
                                                    )}

                                                    {/* Nested Replies (Level 2) */}
                                                    {reply.replies && reply.replies.length > 0 && (
                                                        <div className="mt-3 flex flex-col gap-3 border-l-2 border-border/50 pl-3">
                                                            {reply.replies.map((nestedReply) => (
                                                                <div key={nestedReply.id} className="group/nested-reply relative flex gap-2">
                                                                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated">
                                                                        {nestedReply.author.image ? (
                                                                            <img
                                                                                src={nestedReply.author.image || undefined}
                                                                                alt={nestedReply.author.name || ''}
                                                                                className="h-full w-full object-cover"
                                                                                referrerPolicy="no-referrer"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center">
                                                                                <UserIcon className="h-3 w-3 text-foreground-muted" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-1 flex-col gap-0.5">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[11px] font-bold text-foreground">
                                                                                    {nestedReply.author.name || 'User'}
                                                                                </span>
                                                                                <span className="text-[9px] text-foreground-muted uppercase font-bold tracking-tighter">
                                                                                    {formatDistanceToNow(new Date(nestedReply.createdAt), { addSuffix: true, locale: dateLocale })}
                                                                                </span>
                                                                            </div>
                                                                            {(currentUserId === nestedReply.author.id || userRole === 'OWNER' || userRole === 'ADMIN') && (
                                                                                <button
                                                                                    onClick={() => handleDelete(nestedReply.id)}
                                                                                    className="opacity-0 group-hover/nested-reply:opacity-100 transition-opacity p-0.5 text-foreground-muted hover:text-red-500"
                                                                                    title={c_common('deletePost')}
                                                                                >
                                                                                    <Trash2 className="h-2.5 w-2.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="rounded-2xl rounded-tl-none bg-surface-elevated/30 p-2 text-xs leading-relaxed text-foreground">
                                                                            {nestedReply.content}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
