import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { List, Lock } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { UI } from '@/lib/constants';
import type { AnnouncementItemData } from '@/lib/services/announcements-page';

const WEEK = 7 * 24 * 60 * 60 * 1000;

type Props = {
    item: AnnouncementItemData;
    /** Informācija shows three lines; Jaunumi the whole text. */
    clamp?: boolean;
    /** The team's "…" menu (Jaunumi only). */
    menu?: ReactNode;
};

/** One announcement (AR-53) in the look of Manas grupas' items: icon, title, text, then who wrote it and when. Members-only items say so quietly. */
export default function AnnouncementItem({ item, clamp, menu }: Props) {
    const t = useTranslations('group');
    const format = useFormatter();
    const now = new Date();
    const created = new Date(item.createdAt);
    const when = now.getTime() - created.getTime() > WEEK
        ? format.dateTime(created, { dateStyle: 'medium' })
        : format.relativeTime(created, created > now ? created : now);
    const author = item.author.name ?? item.author.username;

    return (
        <article data-ui={UI.announcementItem} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 rounded-2xl bg-surface px-[18px] py-3.5">
            <List aria-hidden="true" strokeWidth={1.8} className="mt-0.5 size-[18px] text-foreground-muted" />
            <div className="min-w-0">
                <h3 className="break-words font-semibold leading-snug text-foreground">{item.title}</h3>
                {item.content && (
                    <p className={clsx('mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground', clamp && 'line-clamp-3')}>{item.content}</p>
                )}
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-foreground-muted">
                    <span className="min-w-0 break-words">
                        {t('announcementBy', { name: author ?? '', when })}
                    </span>
                    {item.visibility === 'MEMBERS_ONLY' && (
                        <Badge tone="muted"><Lock aria-hidden="true" />{t('announcementMembersOnly')}</Badge>
                    )}
                </p>
            </div>
            {menu && <div className="-mr-2 -mt-1.5">{menu}</div>}
        </article>
    );
}
