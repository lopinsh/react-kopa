import { getPendingWildcards, getPendingReports, approveWildcard, rejectWildcard, dismissReport, suspendReportedGroup } from '@/actions/admin-actions';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ShieldAlert, Tags, Check, X, AlertTriangle, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboardPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale } = await params;
    const { tab } = await searchParams;
    const activeTab = tab || 'tags';
    const t = await getTranslations('admin');

    const session = await auth();
    if (!session?.user?.email) {
        redirect(`/${locale}/api/auth/signin`);
    }

    // Very basic authorization check
    if (session.user.email !== 'admin@local' && session.user.email !== 'owner@local') {
        notFound();
    }

    const wildcardsRes = await getPendingWildcards();
    const wildcards = wildcardsRes.success ? wildcardsRes.data?.wildcards : [];

    const reportsRes = await getPendingReports();
    const reports = reportsRes.success ? reportsRes.data?.reports : [];

    // Inline server actions for the forms
    async function handleApproveWildcard(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await approveWildcard(id);
    }

    async function handleRejectWildcard(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await rejectWildcard(id);
    }

    async function handleDismissReport(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await dismissReport(id);
    }

    async function handleSuspendGroup(formData: FormData) {
        'use server';
        const reportId = formData.get('reportId') as string;
        const groupId = formData.get('groupId') as string;
        await suspendReportedGroup(reportId, groupId);
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    {t('title')}
                </h1>
                <p className="text-foreground-muted mt-2">{t('subtitle')}</p>
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
            </div>

            {/* Content */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">

                {activeTab === 'tags' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('pendingCustomTags')}</h2>
                        {!wildcards || wildcards.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{t('noPendingTags')}</p>
                        ) : (
                            <div className="space-y-4">
                                {wildcards.map(tag => (
                                    <div key={tag.id} className="flex justify-between items-center bg-surface-elevated p-4 rounded-lg border border-border">
                                        <div>
                                            {/* We use [0] because we included titles. In a real app we'd filter by locale. */}
                                            <h3 className="font-bold text-foreground text-lg">{tag.titles[0]?.title || tag.slug}</h3>
                                            <p className="text-sm text-foreground-muted">
                                                {t('proposedUnder', { parent: tag.parent?.titles?.[0]?.title || tag.parent?.slug || t('unknown') })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <form action={handleRejectWildcard}>
                                                <input type="hidden" name="id" value={tag.id} />
                                                <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors">
                                                    <X className="h-4 w-4" />
                                                    {t('reject')}
                                                </button>
                                            </form>
                                            <form action={handleApproveWildcard}>
                                                <input type="hidden" name="id" value={tag.id} />
                                                <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                                                    <Check className="h-4 w-4" />
                                                    {t('approve')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('tabReports')}</h2>
                        {!reports || reports.length === 0 ? (
                            <p className="text-foreground-muted text-center py-12">{t('noPendingReports')}</p>
                        ) : (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <div key={report.id} className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-surface-elevated p-4 rounded-lg border border-red-500/20">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {t('reportLabel')}
                                                </span>
                                                <span className="text-sm text-foreground-muted">
                                                    {t('reportedBy', { name: report.reporter.name || t('unknown') })}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-foreground">
                                                {report.targetGroupId ? t('reportedGroup', { name: report.group?.name || t('unknown') }) : ''}
                                                {report.targetEventId ? t('reportedEvent', { title: report.event?.title || t('unknown') }) : ''}
                                            </h3>
                                            <p className="text-sm text-foreground-muted mt-1 bg-background/50 p-2 rounded border border-border/50">
                                                "{report.reason}"
                                            </p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <form action={handleDismissReport} className="flex-1 md:flex-none">
                                                <input type="hidden" name="id" value={report.id} />
                                                <button type="submit" className="w-full flex justify-center items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors">
                                                    <Check className="h-4 w-4" />
                                                    {t('dismiss')}
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
