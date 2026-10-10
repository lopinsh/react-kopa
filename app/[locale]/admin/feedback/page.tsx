import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { FEEDBACK_KINDS, FEEDBACK_TABS } from '@/lib/constants';
import { FeedbackService } from '@/lib/services/feedback.service';
import { feedbackFilterSchema } from '@/lib/validations/feedback';
import { Link } from '@/i18n/routing';
import FeedbackAdminRow from '@/components/admin/FeedbackAdminRow';
import FeedbackPurgeButton from '@/components/admin/FeedbackPurgeButton';

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
    const filter = feedbackFilterSchema.parse({ kind: first(raw.kind), tab: first(raw.tab), page: first(raw.page) });
    const result = await FeedbackService.list(session.user.id, filter);
    const notes = result.success ? result.data ?? [] : [];
    const countsResult = await FeedbackService.counts(session.user.id);
    const counts = countsResult.success && countsResult.data ? countsResult.data : { open: 0, completed: 0 };
    const tab = filter.tab ?? 'open';

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

            <nav aria-label={t('tabs')} className="mb-6 flex border-b border-border">
                {FEEDBACK_TABS.map((id) => (
                    <Link
                        key={id}
                        href={id === 'open' ? '/admin/feedback' : `/admin/feedback?tab=${id}`}
                        aria-current={tab === id ? 'page' : undefined}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === id ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                    >
                        {t(`tab.${id}`)}
                        <span className={`rounded-full px-2 py-0.5 text-xs ${tab === id ? 'bg-primary/10 text-primary' : 'bg-border/50 text-foreground-muted'}`}>{counts[id]}</span>
                    </Link>
                ))}
            </nav>

            {/* A plain GET form: filters live in the URL, no client code needed. */}
            <form method="get" className="mb-6 flex flex-wrap items-center gap-2">
                <input type="hidden" name="tab" value={tab} />
                <select name="kind" defaultValue={filter.kind ?? ''} aria-label={t('filterKind')} className={FIELD}>
                    <option value="">{t('allKinds')}</option>
                    {FEEDBACK_KINDS.map((k) => <option key={k} value={k}>{tMode(`kind.${k}`)}</option>)}
                </select>
                <input name="page" defaultValue={filter.page ?? ''} placeholder={t('filterPage')} aria-label={t('filterPage')} className={`${FIELD} w-full sm:w-56`} />
                <button type="submit" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90">{t('filter')}</button>
                {tab === 'completed' && counts.completed > 0 && (
                    <div className="sm:ml-auto"><FeedbackPurgeButton count={counts.completed} /></div>
                )}
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
