import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin-access';
import Link from 'next/link';
import { getTranslations, getTimeZone } from 'next-intl/server';
import { ModerationService } from '@/lib/services/moderation.service';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ModerationLog from '@/components/admin/ModerationLog';
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
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />

            {error && (
                <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                    {tErrors.has(error) ? tErrors(error) : tErrors('ACTION_FAILED')}
                </p>
            )}

            {/* Content */}
            <div className="space-y-6">

                {(
                    <>
                    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">{tMod('hiddenGroupsTitle')}</h2>
                        {hiddenGroups.length === 0 ? (
                            <p className="text-foreground-muted text-center py-8">{tMod('hiddenGroupsEmpty')}</p>
                        ) : (
                            <ul className="space-y-3">
                                {hiddenGroups.map(g => (
                                    <li key={g.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-start sm:justify-between">
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
                    </section>
                    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">{tMod('logTitle')}</h2>
                        {group && (
                            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
                                {tMod('logFiltered')}
                                <Link href={`/${locale}/admin?tab=moderation`} className="font-semibold text-primary hover:underline">{tMod('logShowAll')}</Link>
                            </p>
                        )}
                        {moderationLog.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{tMod('logEmpty')}</p>
                        ) : (
                            <ModerationLog entries={moderationLog} locale={locale} formatDate={(d) => format.dateTime(d, { dateStyle: 'medium', timeStyle: 'short' })} />
                        )}
                    </section>
                    </>
                )}

            </div>
        </div>
    );
}

