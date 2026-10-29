import { useFormatter, useTranslations } from 'next-intl';
import { useDateFormatter } from '@/lib/date-format';
import type { VitalityPresence } from '@/lib/services/vitality.service';

const DAY = { day: 'numeric', month: 'short', year: 'numeric' } as const;
const DAY_MS = 86_400_000;

/** Who came back (R31-2): active users in 24 h, 7 d and 30 d by their day-level last visit, and the return rate. */
export default function PresenceCard({ presence, now }: { presence: VitalityPresence; now: Date }) {
    const t = useTranslations('admin.vitality');
    const format = useFormatter();
    const dates = useDateFormatter();
    const counts = [['active1', presence.active1], ['active7', presence.active7], ['active30', presence.active30]] as const;
    const rate = presence.cohort === 0
        ? '—'
        : t('returnRateValue', {
            returned: format.number(presence.returned),
            cohort: format.number(presence.cohort),
            percent: format.number(presence.returned / presence.cohort, { style: 'percent', maximumFractionDigits: 0 }),
        });
    const complete = presence.since ? new Date(presence.since.getTime() + 30 * DAY_MS) : null;

    return (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6" aria-labelledby="vitality-presence">
            <h2 id="vitality-presence" className="text-section">{t('presence')}</h2>
            <dl className="grid grid-cols-3 gap-4">
                {counts.map(([key, n]) => (
                    <div key={key} className="min-w-0">
                        <dt className="text-meta text-foreground-muted">{t(key)}</dt>
                        <dd className="text-title tabular-nums">{format.number(n)}</dd>
                    </div>
                ))}
            </dl>
            <p className="text-meta text-foreground-muted">{t('activeNote')}</p>
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3 text-body-sm">
                <p className="min-w-0">{t('returnRate')}</p>
                <p className="shrink-0 text-right tabular-nums">{rate}</p>
            </div>
            <p className="text-meta text-foreground-muted">{t('returnRateNote')}</p>
            <p className="text-meta text-foreground-muted">
                {presence.since ? t('seenSince', { date: dates.dateTime(presence.since, DAY).replace(/[.]$/, '') }) : t('noPresence')}
                {complete && complete > now && ` ${t('returnFrom', { date: dates.dateTime(complete, DAY).replace(/[.]$/, '') })}`}
            </p>
        </section>
    );
}
