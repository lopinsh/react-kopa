'use client';

import { useTranslations, useNow } from 'next-intl';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { relativeTo } from '@/lib/utils/relative-time';
import type { AnnouncementRow } from '@/lib/services/post.service';
import { UI } from '@/lib/constants';
import { hasAdminRights } from '@/lib/utils/permissions';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useDateFormatter } from '@/lib/date-format';

type Props = {
    post: AnnouncementRow;
    busy: boolean;
    onArchive: (post: AnnouncementRow) => void;
    onDelete: (post: AnnouncementRow) => void;
};

const BUTTON = 'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground-muted transition-colors hover:bg-surface-elevated disabled:opacity-50';

export default function AnnouncementCard({ post, busy, onArchive, onDelete }: Props) {
    const t = useTranslations('group');
    // Owner and admins get Archive (or Restore) and Delete.
    const canManage = hasAdminRights(useGroupContext().user.role);
    const tCommon = useTranslations('common');
    const format = useDateFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const archived = post.archivedAt !== null;
    const created = new Date(post.createdAt);

    // Relative time for today (Riga calendar day), the full date after that.
    const day = (d: Date) => format.dateTime(d, { year: 'numeric', month: '2-digit', day: '2-digit' });
    const when = day(created) === day(now)
        ? relativeTo(format, created, now)
        : format.dateTime(created, { dateStyle: 'long' });

    return (
        <article data-ui={UI.announcementCard} className="rounded-2xl border border-border bg-surface p-5 shadow-premium sm:p-6">
            <h3 className="break-words text-lg font-black leading-snug tracking-tight text-foreground">{post.title}</h3>
            <p className="mt-1 text-xs font-medium text-foreground-muted">
                <time dateTime={created.toISOString()}>{when}</time>
                {post.author.name && <> · {post.author.name}</>}
                {post.archivedAt && (
                    <> · {t('announcementArchivedOn', { date: format.dateTime(new Date(post.archivedAt), { dateStyle: 'medium' }) })}</>
                )}
            </p>
            {post.content && (
                <p className="mt-4 whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">{post.content}</p>
            )}
            {canManage && (
                <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
                    <button type="button" onClick={() => onArchive(post)} disabled={busy} className={BUTTON}>
                        {archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        {archived ? t('announcementRestore') : t('announcementArchive')}
                    </button>
                    <button type="button" onClick={() => onDelete(post)} disabled={busy} className={`${BUTTON} hover:!text-danger`}>
                        <Trash2 className="h-3.5 w-3.5" />
                        {tCommon('delete')}
                    </button>
                </div>
            )}
        </article>
    );
}
