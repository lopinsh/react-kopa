import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useDateFormatter } from '@/lib/date-format';
import type { VitalitySnapshot } from '@/lib/services/vitality.service';

const DAY = { day: 'numeric', month: 'short', year: 'numeric' } as const;

/** Active, quiet and empty groups, and the quiet ones with the date they last showed life. */
export default function GroupHealth({ health }: { health: VitalitySnapshot['health'] }) {
    const t = useTranslations('admin.vitality');
    const format = useFormatter();
    const dates = useDateFormatter();
    const counts = [['active', health.active], ['quiet', health.quiet], ['empty', health.empty]] as const;

    return (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="vitality-health">
            <h2 id="vitality-health" className="text-section">{t('health')}</h2>
            <dl className="grid grid-cols-3 gap-4">
                {counts.map(([key, n]) => (
                    <div key={key} className="min-w-0">
                        <dt className="text-meta text-foreground-muted">{t(key)}</dt>
                        <dd className="text-title tabular-nums">{format.number(n)}</dd>
                    </div>
                ))}
            </dl>
            <p className="text-meta text-foreground-muted">{t('healthNote')}</p>
            <h3 className="text-item">{t('quietList')}</h3>
            {health.quietGroups.length === 0 ? (
                <p className="text-meta text-foreground-muted">{t('quietNone')}</p>
            ) : (
                <ul className="divide-y divide-border">
                    {health.quietGroups.map((g) => (
                        <li key={g.id} className="flex flex-col gap-1 py-3 text-body-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                            <Link href={g.href} className="min-w-0 text-primary hover:underline [overflow-wrap:anywhere]">{g.name}</Link>
                            <time dateTime={g.lastActivity.toISOString()} className="shrink-0 whitespace-nowrap text-meta text-foreground-muted">
                                {t('lastActivity', { date: dates.dateTime(g.lastActivity, DAY) })}
                            </time>
                        </li>
                    ))}
                </ul>
            )}
            {health.quietMore > 0 && <p className="text-meta text-foreground-muted">{t('quietMore', { count: format.number(health.quietMore) })}</p>}
        </section>
    );
}
