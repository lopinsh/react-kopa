import { List, UserCheck, UserX } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import { relativeTo } from '@/lib/utils/relative-time';
import { UI } from '@/lib/constants';
import type { NewsGroup, NewsItem as NewsItemData } from '@/lib/types/own-area';

/** The group's name as a link to a full page of the group (cmv9amjft: your own groups never open as a panel); plain text when it cannot be found any more. */
function GroupName({ group, page }: { group: NewsGroup; page: 'home' | 'announcements' }) {
    const locale = useLocale();
    if (!group.path) return <span className="weight-strong">{group.name}</span>;
    return <a href={`/${locale}${group.path}${page === 'announcements' ? '/announcements' : ''}`} className={TEXT_LINK_CLASS}>{group.name}</a>;
}

/** One entry of Jaunumi (AR-61): icon, the group (link) with its category and when, a small dot while new, then the announcement or the answer. */
export default function NewsItem({ item, now }: { item: NewsItemData; now: Date }) {
    const t = useTranslations('profile.myGroups');
    const format = useFormatter();
    const { group } = item;
    const Icon = item.kind === 'post' ? List : item.accepted ? UserCheck : UserX;

    return (
        <article data-ui={UI.newsItem} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3" style={group.color ? { ['--c' as string]: group.color } : undefined}>
            <Icon aria-hidden="true" className="mt-0.5 size-[18px] text-foreground-muted" />
            <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-meta text-foreground-muted">
                    {item.kind === 'post' && <GroupName group={group} page="announcements" />}
                    {item.kind === 'post' && group.categoryTitle && (
                        <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" />
                            <span className="text-foreground">{group.categoryTitle}</span>
                            {group.subCategory && <span>{group.subCategory}</span>}
                        </span>
                    )}
                    <span>{item.kind === 'post' && '· '}{relativeTo(format, item.at, now)}</span>
                    {item.isNew && <span role="img" aria-label={t('new')} className="size-2 shrink-0 rounded-full bg-primary" />}
                </p>
                {item.kind === 'post' ? (
                    <>
                        <p className="mt-0.5 weight-strong text-foreground">{item.title}</p>
                        {item.excerpt && <p className="mt-0.5 line-clamp-2 text-body-sm text-foreground">{item.excerpt}</p>}
                    </>
                ) : (
                    <p className="mt-0.5 weight-strong text-foreground">
                        {t.rich(item.accepted ? 'answerAccepted' : 'answerDeclined', {
                            name: group.name,
                            group: () => <GroupName group={group} page="home" />,
                        })}
                    </p>
                )}
            </div>
        </article>
    );
}
