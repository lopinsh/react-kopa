import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ModerationService } from '@/lib/services/moderation.service';

type Entry = Awaited<ReturnType<typeof ModerationService.listActions>>[number];
type Props = { entries: Entry[]; locale: string; formatDate: (d: Date) => string };

/** The removed-content log: card rows on phones, a table from md. */
export default async function ModerationLog({ entries, locale, formatDate }: Props) {
    const tMod = await getTranslations('moderation');
    const tInbox = await getTranslations('admin.taxonomy.inbox');

    const target = (entry: Entry) =>
        entry.target ? (
            <Link href={`/${locale}${entry.target.href}`} className="text-primary hover:underline [overflow-wrap:anywhere]">{entry.target.name}</Link>
        ) : (
            <span className="text-foreground-muted [overflow-wrap:anywhere]">
                {entry.targetType === 'USER' ? (entry.targetName ?? '—') : entry.targetName ? `${entry.targetName} ${tMod('deletedTarget')}` : tMod('deletedTarget')}
            </span>
        );

    return (
        <>
            <ul className="space-y-3 md:hidden">
                {entries.map((entry) => (
                    <li key={entry.id} className="space-y-1 rounded-xl border border-border bg-surface-elevated p-4 text-sm">
                        <p className="font-medium">{tMod(`action_${entry.action}`)}</p>
                        <p>{target(entry)}</p>
                        <p className="text-foreground-muted [overflow-wrap:anywhere]">{entry.reason || '—'}</p>
                        <p className="text-xs text-foreground-muted">{entry.adminName || tInbox('unknown')} · {formatDate(entry.createdAt)}</p>
                    </li>
                ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-foreground-muted">
                        <tr>
                            <th className="py-2 pr-4">{tMod('logWhen')}</th>
                            <th className="py-2 pr-4">{tMod('logAdmin')}</th>
                            <th className="py-2 pr-4">{tMod('logAction')}</th>
                            <th className="py-2 pr-4">{tMod('logTarget')}</th>
                            <th className="py-2">{tMod('logReason')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {entries.map((entry) => (
                            <tr key={entry.id} className="align-top">
                                <td className="whitespace-nowrap py-3 pr-4 text-foreground-muted">{formatDate(entry.createdAt)}</td>
                                <td className="py-3 pr-4">{entry.adminName || tInbox('unknown')}</td>
                                <td className="py-3 pr-4 font-medium">{tMod(`action_${entry.action}`)}</td>
                                <td className="py-3 pr-4">{target(entry)}</td>
                                <td className="max-w-md break-words py-3 text-foreground-muted [overflow-wrap:anywhere]">{entry.reason || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
