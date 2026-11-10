import { CalendarDays, MessageSquareText, Users } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { langAttr } from '@/lib/translations';
import type { FeedPeriod, FeedRow } from '@/lib/services/hub-activity';
import AccordionRow from './AccordionRow';

const ICONS = { announcement: MessageSquareText, event: CalendarDays, group: Users } as const;

/** Aktivitāte (K-24a, K-78): per period a numbers line (zero parts left out), then one-line rows that open (K-79). Public things only, names included, no member names. */
export default async function ActivityFeed({ periods, locale }: { periods: FeedPeriod[]; locale: string }) {
    const [t, format] = await Promise.all([getTranslations({ locale, namespace: 'hub.activity' }), getFormatter({ locale })]);
    const now = new Date();
    const when = (at: Date) => format.relativeTime(at, { now: at > now ? at : now, style: 'narrow' });
    if (periods.length === 0) return <p className="text-body-sm text-foreground-muted">{t('empty')}</p>;

    const meta = (r: FeedRow) => (
        <>
            <span>{t(r.kind === 'announcement' ? 'kindAnnouncement' : r.kind === 'event' ? 'kindEvent' : 'kindGroup')}</span>
            {r.kind !== 'group' && <><span aria-hidden="true">·</span><Link href={r.groupHref} className="underline underline-offset-2 hover:text-foreground">{r.group.name}</Link></>}
        </>
    );

    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
            {periods.map((p) => {
                const parts = [
                    p.counts.groups > 0 && t('groupsCreated', { n: p.counts.groups }),
                    p.counts.members > 0 && t('newMembers', { n: p.counts.members }),
                    p.counts.announcements > 0 && t('announcements', { n: p.counts.announcements }),
                ].filter(Boolean);
                return (
                    <section key={p.key} aria-labelledby={`feed-${p.key}`}>
                        <h3 id={`feed-${p.key}`} className="text-item text-foreground">{t(p.key)}</h3>
                        {parts.length > 0 && <p className="mt-0.5 text-meta text-foreground-muted">{parts.join(', ')}</p>}
                        <div className="mt-1">
                            {p.rows.map((r) => {
                                const Icon = ICONS[r.kind];
                                return (
                                    <AccordionRow
                                        key={r.id}
                                        icon={<Icon />}
                                        title={r.kind === 'group' ? t('groupCreatedRow', { name: r.title }) : r.title}
                                        lang={r.kind === 'group' ? undefined : langAttr(r.titleLang, locale)}
                                        when={when(r.at)}
                                        body={r.excerpt}
                                        meta={meta(r)}
                                        action={{ href: r.href, label: t('showMore') }}
                                    />
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
