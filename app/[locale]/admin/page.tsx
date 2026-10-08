import { getPendingWildcards, getPendingReports, approveWildcard, rejectWildcard, dismissReport, suspendReportedGroup } from '@/actions/admin-actions';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ShieldAlert, Tags, Check, X, AlertTriangle, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { signInUrl } from '@/lib/auth-redirect';
import { getFormatter } from 'next-intl/server';
import { ModerationService } from '@/lib/services/moderation.service';
import type { ActionResponse } from '@/types/actions';

/** Returns an inline admin form action to its tab; a failure is shown via ?error=CODE. */
function backToTab(locale: string, tabName: string, res: ActionResponse): never {
    redirect(`/${locale}/admin?tab=${tabName}${res.success ? '' : `&error=${res.error}`}`);
}

export default async function AdminDashboardPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string; error?: string }>;
}) {
    const { locale } = await params;
    const { tab, error } = await searchParams;
    const activeTab = tab || 'tags';
    const t = await getTranslations('admin.dashboard');
    const tReports = await getTranslations('admin.reports');
    const tTax = await getTranslations('admin.taxonomy');
    const tInbox = await getTranslations('admin.taxonomy.inbox');
    const c = await getTranslations('common');
    const tMod = await getTranslations('moderation');
    const tErrors = await getTranslations('errors');
    const format = await getFormatter();

    const session = await auth();
    if (!session?.user?.id) {
        redirect(signInUrl(locale, '/admin'));
    }

    if (session.user.role !== 'ADMIN') {
        notFound();
    }

    const wildcardsRes = await getPendingWildcards();
    const wildcards = wildcardsRes.success ? wildcardsRes.data?.wildcards : [];

    const reportsRes = await getPendingReports();
    const reports = reportsRes.success ? reportsRes.data?.reports : [];

    const moderationLog = activeTab === 'moderation' ? await ModerationService.listActions(50) : [];

    // Inline server actions for the forms
    async function handleApproveWildcard(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        backToTab(locale, 'tags', await approveWildcard(id));
    }

    async function handleRejectWildcard(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        backToTab(locale, 'tags', await rejectWildcard(id));
    }

    async function handleDismissReport(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        backToTab(locale, 'reports', await dismissReport(id));
    }

    async function handleSuspendGroup(formData: FormData) {
        'use server';
        const reportId = formData.get('reportId') as string;
        const groupId = formData.get('groupId') as string;
        backToTab(locale, 'reports', await suspendReportedGroup(reportId, groupId));
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    {t('title')}
                </h1>
                <p className="text-foreground-muted mt-2">{t('subtitle')}</p>
                <div className="mt-3 flex items-center gap-4 text-sm font-semibold">
                    <Link href={`/${locale}/admin/reports`} className="text-foreground-muted hover:text-foreground">{t('tabReports')}</Link>
                    <Link href={`/${locale}/admin/taxonomy`} className="text-foreground-muted hover:text-foreground">{tTax('navLink')}</Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-8">
                <Link
                    href={`/${locale}/admin?tab=tags`}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'tags'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                >
                    <Tags className="h-4 w-4" />
                    {t('tabTags')}
                    {wildcards && wildcards.length > 0 && (
                        <span className="ml-2 bg-primary/10 text-primary text-xs py-0.5 px-2 rounded-full">
                            {wildcards.length}
                        </span>
                    )}
                </Link>
                <Link
                    href={`/${locale}/admin?tab=reports`}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'reports'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                >
                    <AlertTriangle className="h-4 w-4" />
                    {t('tabReports')}
                    {reports && reports.length > 0 && (
                        <span className="ml-2 bg-red-500/10 text-red-500 text-xs py-0.5 px-2 rounded-full">
                            {reports.length}
                        </span>
                    )}
                </Link>
                <Link
                    href={`/${locale}/admin?tab=moderation`}
                    className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'moderation'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-foreground-muted hover:text-foreground'
                        }`}
                >
                    <EyeOff className="h-4 w-4" />
                    {t('tabModeration')}
                </Link>
            </div>

            {error && (
                <p role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
                    {tErrors.has(error) ? tErrors(error) : tErrors('ACTION_FAILED')}
                </p>
            )}

            {/* Content */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">

                {activeTab === 'tags' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('pendingCustomTags')}</h2>
                        {!wildcards || wildcards.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{tInbox('noPendingTags')}</p>
                        ) : (
                            <div className="space-y-4">
                                {wildcards.map(tag => (
                                    <div key={tag.id} className="flex justify-between items-center bg-surface-elevated p-4 rounded-lg border border-border">
                                        <div>
                                            {/* We use [0] because we included titles. In a real app we'd filter by locale. */}
                                            <h3 className="font-bold text-foreground text-lg">{tag.titles[0]?.title || tag.slug}</h3>
                                            <p className="text-sm text-foreground-muted">
                                                {tInbox('proposedUnder', { parent: tag.parent?.titles?.[0]?.title || tag.parent?.slug || tInbox('unknown') })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <form action={handleRejectWildcard}>
                                                <input type="hidden" name="id" value={tag.id} />
                                                <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors">
                                                    <X className="h-4 w-4" />
                                                    {c('reject')}
                                                </button>
                                            </form>
                                            <form action={handleApproveWildcard}>
                                                <input type="hidden" name="id" value={tag.id} />
                                                <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                                                    <Check className="h-4 w-4" />
                                                    {c('approve')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{tMod('logTitle')}</h2>
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
                                                        <span className="text-foreground-muted">{tMod('deletedTarget')}</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-foreground-muted">{entry.reason || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('tabReports')}</h2>
                        {!reports || reports.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{tReports('noPendingReports')}</p>
                        ) : (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <div key={report.id} className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-surface-elevated p-4 rounded-lg border border-red-500/20">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {c('reportLabel')}
                                                </span>
                                                <span className="text-sm text-foreground-muted">
                                                    {tReports('reportedBy', { name: report.reporter.name || tInbox('unknown') })}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-foreground">
                                                {report.targetGroupId ? tReports('reportedGroup', { name: report.group?.name || tInbox('unknown') }) : ''}
                                                {report.targetEventId ? tReports('reportedEvent', { title: report.event?.title || tInbox('unknown') }) : ''}
                                            </h3>
                                            <p className="text-sm text-foreground-muted mt-1 bg-background/50 p-2 rounded border border-border/50">
                                                &quot;{report.reason}&quot;
                                            </p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <form action={handleDismissReport} className="flex-1 md:flex-none">
                                                <input type="hidden" name="id" value={report.id} />
                                                <button type="submit" className="w-full flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors">
                                                    <Check className="h-4 w-4" />
                                                    {c('dismiss')}
                                                </button>
                                            </form>
                                            {report.targetGroupId && (
                                                <form action={handleSuspendGroup} className="flex-1 md:flex-none">
                                                    <input type="hidden" name="reportId" value={report.id} />
                                                    <input type="hidden" name="groupId" value={report.targetGroupId} />
                                                    <button type="submit" className="w-full flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                                                        <EyeOff className="h-4 w-4" />
                                                        {t('suspendGroup')}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

