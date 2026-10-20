'use client';

import { createElement } from 'react';
import { useFormatter, useLocale, useNow, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { notificationIcon } from '@/lib/notification-icons';
import { formatNotificationText } from '@/lib/utils/notification-text';
import { relativeTo } from '@/lib/utils/relative-time';
import { UI } from '@/lib/constants';
import type { NotificationView } from '@/lib/types/own-area';

const STRETCH = 'outline-none after:absolute after:inset-0 after:z-[1]';

/**
 * One notification (AR-65): the type icon, the headline (the whole row opens its link) with the group as a link, a quiet line (the
 * person's words, else the group's category), and at the right the time and a dot while unread. A tap reads it; its ✓ reads it without opening.
 */
export default function NotificationItem({ n, onRead }: { n: NotificationView; onRead: (n: NotificationView) => void }) {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const { headline, detail, groupName } = formatNotificationText(t, n.type, n.message, locale);
    const { group } = n;
    const tap = () => onRead(n);

    return (
        <li data-ui={UI.notificationItem} className={clsx('group relative flex gap-3 px-4 py-3 transition-colors hover:bg-tint/60 has-[.stretch:focus-visible]:outline has-[.stretch:focus-visible]:-outline-offset-2 has-[.stretch:focus-visible]:outline-2 has-[.stretch:focus-visible]:outline-primary', !n.read && 'bg-primary/5')}>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-tint text-foreground-muted">{createElement(notificationIcon(n.type), { className: 'size-4', strokeWidth: 1.8 })}</span>
            <div className="min-w-0 flex-1 pr-7">
                <p className="text-[13px] leading-snug">
                    {n.link
                        ? <Link href={n.link} onClick={tap} className={clsx('stretch font-semibold text-foreground', STRETCH)}>{headline}</Link>
                        : <button type="button" onClick={tap} className={clsx('stretch text-left font-semibold text-foreground', STRETCH)}>{headline}</button>}
                    {group?.path ? (
                        <> · <Link href={group.path} className="relative z-[2] font-semibold text-primary hover:underline">{group.name}</Link></>
                    ) : groupName ? <span className="text-foreground-muted"> · {groupName}</span> : null}
                </p>
                {!n.read && n.moreCount > 0 && <p className="text-[11px] font-semibold text-primary">{t('more', { count: n.moreCount })}</p>}
                {detail !== undefined ? (
                    <p className="mt-0.5 line-clamp-2 break-words text-xs leading-snug text-foreground-muted">{detail}</p>
                ) : group?.categoryTitle && (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-foreground-muted" style={group.color ? { ['--c' as string]: group.color } : undefined}>
                        <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--c)]" />
                        <span className="truncate"><span className="text-foreground">{group.categoryTitle}</span>{group.subCategory && ` ${group.subCategory}`}</span>
                    </p>
                )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-[11px] text-foreground-muted">
                <span className="whitespace-nowrap">{relativeTo(format, new Date(n.createdAt), now)}</span>
                {!n.read && <span role="img" aria-label={t('unread')} className="size-2 rounded-full bg-primary" />}
            </div>
            {!n.read && (
                <button
                    type="button"
                    onClick={tap}
                    title={t('markRead')}
                    aria-label={t('markRead')}
                    className="absolute bottom-2 right-3 z-[2] grid size-6 place-items-center rounded-pill bg-primary/10 text-primary opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                >
                    <Check aria-hidden className="size-3" />
                </button>
            )}
        </li>
    );
}
