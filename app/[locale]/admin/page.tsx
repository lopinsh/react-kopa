import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin-access';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, getTimeZone } from 'next-intl/server';
import { ModerationService } from '@/lib/services/moderation.service';
import HiddenGroupActions from '@/components/admin/HiddenGroupActions';
import { createDateFormatter } from '@/lib/date-format';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const tDash = await getTranslations({ locale, namespace: 'admin.dashboard' });
    return { title: tDash('title') };
}

export default async function AdminDashboardPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string; error?: string; group?: string }>;
}) {
    const { locale } = await params;
    const { tab, error, group } = await searchParams;
    // Old links: reports have their own page, new tags are reviewed on top of Taxonomy.
    if (tab === 'reports') redirect(`/${locale}/admin/reports`);
    if (tab === 'tags') redirect(`/${locale}/admin/categories`);
    const { isOwner } = await requireAdminPage(locale, '/admin');

    const [t, tInbox, tMod, tErrors, timeZone, [moderationLog, hiddenGroups]] = await Promise.all([
        getTranslations('admin.dashboard'),
        getTranslations('admin.taxonomy.inbox'),
        getTranslations('moderation'),
        getTranslations('errors'),
        getTimeZone(),
        Promise.all([ModerationService.listActions(50, group), ModerationService.listHiddenGroups()]),
    ]);
    const format = createDateFormatter(locale, timeZone);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    {t('title')}
                </h1>
                <p className="text-foreground-muted mt-2">{t('subtitle')}</p>
            </div>

            {error && (
                <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                    {tErrors.has(error) ? tErrors(error) : tErrors('ACTION_FAILED')}
                </p>
            )}

            {/* Content */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">

                {(
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{tMod('hiddenGroupsTitle')}</h2>
                        {hiddenGroups.length === 0 ? (
                            <p className="mb-10 text-foreground-muted text-center py-8">{tMod('hiddenGroupsEmpty')}</p>
                        ) : (
                            <ul className="mb-10 space-y-3">
                                {hiddenGroups.map(g => (
                                    <li key={g.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <Link href={`/${locale}${g.href}`} className="font-bold text-primary hover:underline [overflow-wrap:anywhere]">{g.name}</Link>
                                            <p className="text-sm text-foreground-muted">{g.ownerName ? tMod('hiddenOwner', { name: g.ownerName }) : tInbox('unknown')}</p>
                                            <p className="text-sm text-foreground [overflow-wrap:anywhere]">{g.reason || '—'}</p>
                                            <p className="text-xs text-foreground-muted">
                                                {tMod('hiddenBy', { name: g.hiddenByName || tInbox('unknown'), date: format.dateTime(g.hiddenAt, { dateStyle: 'medium', timeStyle: 'short' }) })}
                                            </p>
                                        </div>
                                        <HiddenGroupActions groupId={g.id} groupName={g.name} hiddenReason={g.reason} canDelete={isOwner} />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{tMod('logTitle')}</h2>
                        {group && (
                            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
                                {tMod('logFiltered')}
                                <Link href={`/${locale}/admin?tab=moderation`} className="font-semibold text-primary hover:underline">{tMod('logShowAll')}</Link>
                            </p>
                        )}
                        {moderationLog.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{tMod('logEmpty')}</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase text-foreground-muted">
                                        <tr>
                                            <th className="py-2 pr-4">{tMod('logWhen')}</th>
                                            <th className="py-2 pr-4">{tMod('logAdmin')}</th>
                                            <th className="py-2 pr-4">{tMod('logAction')}</th>
                                            <th className="py-2 pr-4">{tMod('logTarget')}</th>
                                            <th className="py-2">{tMod('logReason')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {moderationLog.map(entry => (
                                            <tr key={entry.id} className="align-top">
                                                <td className="py-3 pr-4 whitespace-nowrap text-foreground-muted">
                                                    {format.dateTime(entry.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="py-3 pr-4">{entry.adminName || tInbox('unknown')}</td>
                                                <td className="py-3 pr-4 font-medium">{tMod(`action_${entry.action}`)}</td>
                                                <td className="py-3 pr-4">
                                                    {entry.target ? (
                                                        <Link href={`/${locale}${entry.target.href}`} className="text-primary hover:underline">{entry.target.name}</Link>
                                                    ) : (
                                                        <span className="text-foreground-muted [overflow-wrap:anywhere]">
                                                            {entry.targetType === 'USER' ? (entry.targetName ?? '—') : entry.targetName ? `${entry.targetName} ${tMod('deletedTarget')}` : tMod('deletedTarget')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 max-w-md break-words text-foreground-muted [overflow-wrap:anywhere]">{entry.reason || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

