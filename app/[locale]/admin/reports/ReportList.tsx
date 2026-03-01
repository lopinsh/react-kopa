'use client';

import { useState, useTransition } from 'react';
import { resolveReport, deleteReportedContent } from '@/actions/report-actions';
import { CheckCircle2, AlertTriangle, ExternalLink, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

type ReportItem = {
    id: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: { id: string; name: string | null; image: string | null };
    group: { id: string; name: string; slug: string; l1Slug: string } | null;
    event: { id: string; title: string } | null;
};

export default function ReportList({ initialReports }: { initialReports: any[] }) {
    const t = useTranslations('admin');
    const [reports, setReports] = useState<ReportItem[]>(initialReports);
    const [isPending, startTransition] = useTransition();

    const handleResolve = (id: string) => {
        startTransition(async () => {
            const res = await resolveReport(id, t('resolvedByAdmin'));
            if (res.success) {
                setReports(current => current.filter(r => r.id !== id));
            }
        });
    };

    const handleDeleteContent = (id: string) => {
        if (!confirm(t('confirmDeleteContent'))) {
            return;
        }
        startTransition(async () => {
            const res = await deleteReportedContent(id);
            if (res.success) {
                setReports(current => current.filter(r => r.id !== id));
            } else {
                alert(t('deleteFailed'));
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
            {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {report.reason}
                                </span>
                                <span className="text-sm font-medium text-foreground-muted">
                                    {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
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
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">Reported By</p>
                                    <div className="flex items-center gap-2">
                                        {report.reporter.image ? (
                                            <img src={report.reporter.image || undefined} alt="" className="h-6 w-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                {report.reporter.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
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
