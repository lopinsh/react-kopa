import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { FEEDBACK_KINDS, FEEDBACK_STATUSES } from '@/lib/constants';
import { FeedbackService } from '@/lib/services/feedback.service';
import { feedbackFilterSchema } from '@/lib/validations/feedback';
import FeedbackAdminRow from '@/components/admin/FeedbackAdminRow';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('feedback') };
}

const FIELD = 'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground';

export default async function AdminFeedbackPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { locale } = await params;
    const raw = await searchParams;
    const t = await getTranslations('admin.feedback');
    const tMode = await getTranslations('feedbackMode');

    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/admin/feedback'));
    if (session.user.role !== 'ADMIN') notFound();

    const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
    const filter = feedbackFilterSchema.parse({ kind: first(raw.kind), status: first(raw.status), page: first(raw.page) });
    const result = await FeedbackService.list(session.user.id, filter);
    const notes = result.success ? result.data ?? [] : [];

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MessageSquareText className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-1 text-foreground-muted">{t('subtitle')}</p>
                </div>
            </div>

            {/* A plain GET form: filters live in the URL, no client code needed. */}
            <form method="get" className="mb-6 flex flex-wrap items-center gap-2">
                <select name="kind" defaultValue={filter.kind ?? ''} aria-label={t('filterKind')} className={FIELD}>
                    <option value="">{t('allKinds')}</option>
                    {FEEDBACK_KINDS.map((k) => <option key={k} value={k}>{tMode(`kind.${k}`)}</option>)}
                </select>
                <select name="status" defaultValue={filter.status ?? ''} aria-label={t('filterStatus')} className={FIELD}>
                    <option value="">{t('allStatuses')}</option>
                    {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{tMode(`status.${s}`)}</option>)}
                </select>
                <input name="page" defaultValue={filter.page ?? ''} placeholder={t('filterPage')} aria-label={t('filterPage')} className={`${FIELD} min-w-0 flex-1 sm:flex-none sm:w-56`} />
                <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90">{t('filter')}</button>
            </form>

            {notes.length === 0 ? (
                <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-foreground-muted">{t('empty')}</p>
            ) : (
                <>
                    <p className="mb-3 text-sm font-semibold text-foreground-muted">{t('count', { count: notes.length })}</p>
                    <ul className="space-y-3">
                        {notes.map((note) => <FeedbackAdminRow key={note.id} note={note} />)}
                    </ul>
                </>
            )}
        </div>
    );
}
