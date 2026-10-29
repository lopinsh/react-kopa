import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useDateFormatter } from '@/lib/date-format';
import type { ActivityEntry } from '@/lib/services/activity.service';

const ACTIVITY_TIME = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;
const LINK = 'text-primary hover:underline [overflow-wrap:anywhere]';

/** One sentence per entry; the time sits below on phones and at the right from sm. */
export default function ActivityRow({ entry }: { entry: ActivityEntry }) {
    const t = useTranslations('admin.activity');
    const format = useDateFormatter();
    const key = entry.kind === 'EVENT_SIGNUP' && entry.status && entry.status !== 'GOING' ? `EVENT_SIGNUP_${entry.status}` : entry.kind;

    const actorName = entry.actor?.name ?? t('unknownUser');
    const actorHref = entry.actor?.href;
    const targetEntry = entry.target;

    return (
        <li className="flex flex-col gap-1 px-4 py-3 text-body-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <p className="min-w-0 [overflow-wrap:anywhere]">
                {t.rich(`kind.${key}` as 'kind.USER_JOINED', {
                    actorName,
                    targetName: targetEntry?.name ?? '',
                    actor: (chunks) => (actorHref ? <Link href={actorHref} className={LINK}>{chunks}</Link> : <span className="weight-medium">{chunks}</span>),
                    target: (chunks) => (targetEntry ? <Link href={targetEntry.href} className={LINK}>{chunks}</Link> : chunks),
                })}
                {targetEntry?.hidden && <span className="text-meta text-foreground-muted"> ({t('hidden')})</span>}
            </p>
            <time dateTime={entry.at.toISOString()} className="shrink-0 whitespace-nowrap text-meta text-foreground-muted">{format.dateTime(entry.at, ACTIVITY_TIME)}</time>
        </li>
    );
}
