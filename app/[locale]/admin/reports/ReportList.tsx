'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { resolveReport, deleteReportedContent } from '@/actions/report-actions';
import { isReportReason, EVENT_TIME_ZONE } from '@/lib/constants';
import { CheckCircle2, AlertTriangle, ExternalLink, Calendar, Users, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useFormatter, useTranslations } from 'next-intl';
import { avatarUrl } from '@/lib/avatar';

const HideGroupModal = dynamic(() => import('@/components/modals/HideGroupModal'), { ssr: false });

type ReportItem = {
    id: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: { id: string; name: string | null; image: string | null; avatarSeed?: string | null };
    group: { id: string; name: string; slug: string; l1Slug: string } | null;
    event: { id: string; title: string } | null;
};

export default function ReportList({ initialReports }: { initialReports: ReportItem[] }) {
    const t = useTranslations('admin.reports');
    const tReason = useTranslations('report');
    const tMod = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const [reports, setReports] = useState<ReportItem[]>(initialReports);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [hidingReport, setHidingReport] = useState<ReportItem | null>(null);

    const showError = (code: string) => setError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const handleResolve = (id: string) => {
        setError(null);
        startTransition(async () => {
            const res = await resolveReport(id);
            if (res.success) {
                setReports(current => current.filter(r => r.id !== id));
            } else {
                showError(res.error);
            }
        });
    };

    const handleDeleteContent = (id: string) => {
        if (!confirm(t('confirmDeleteContent'))) {
            return;
        }
        setError(null);
        startTransition(async () => {
            const res = await deleteReportedContent(id);
            if (res.success) {
                setReports(current => current.filter(r => r.id !== id));
            } else {
                setError(t('deleteFailed'));
            }
        });
    };

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-24 text-center bg-surface">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-500">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="mt-8 text-2xl font-black text-foreground">
                    {t('allClear')}
                </h2>
                <p className="mt-2 text-foreground-muted max-w-sm mx-auto">
                    {t('allClearDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {hidingReport?.group && (
                <HideGroupModal
                    isOpen
                    onClose={() => setHidingReport(null)}
                    groupId={hidingReport.group.id}
                    reportId={hidingReport.id}
                    onHidden={() => setReports(current => current.filter(r => r.id !== hidingReport.id))}
                />
            )}
            {error && (
                <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">{error}</p>
            )}
            {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {isReportReason(report.reason) ? tReason(`reason${report.reason}`) : report.reason}
                                </span>
                                <span className="text-sm font-medium text-foreground-muted">
                                    {format.dateTime(new Date(report.createdAt), { dateStyle: 'medium', timeStyle: 'short', timeZone: EVENT_TIME_ZONE })}
                                </span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 rounded-xl bg-surface-elevated p-4 border border-border">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">{t('reportedEntity')}</p>
                                    {report.group && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            <Link href={`/${report.group.l1Slug}/group/${report.group.slug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1">
                                                {report.group.name}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    )}
                                    {report.event && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium text-foreground">{report.event.title}</span>
                                        </div>
                                    )}
                                    {/* The group or event was deleted after the report was filed. */}
                                    {!report.group && !report.event && (
                                        <span className="text-sm text-foreground-muted">{tMod('deletedTarget')}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">{t('reportedByLabel')}</p>
                                    <div className="flex items-center gap-2">
                                        <img src={avatarUrl(report.reporter)} alt="" className="h-6 w-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                        <span className="text-sm font-medium text-foreground">{report.reporter.name || t('anonymousUser')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={() => handleResolve(report.id)}
                                disabled={isPending}
                                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPending ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        {t('markAsResolved')}
                                    </>
                                )}
                            </button>
                            {report.group && (
                                <button
                                    onClick={() => setHidingReport(report)}
                                    disabled={isPending}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-all disabled:opacity-50"
                                >
                                    <EyeOff className="h-4 w-4" />
                                    {tMod('hideGroup')}
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteContent(report.id)}
                                disabled={isPending}
                                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-6 py-3 text-sm font-bold text-red-600 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPending ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                    <>
                                        <AlertTriangle className="h-4 w-4" />
                                        {t('deleteContent')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
