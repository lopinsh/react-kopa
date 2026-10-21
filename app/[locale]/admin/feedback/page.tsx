import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { FEEDBACK_KINDS, FEEDBACK_TABS } from '@/lib/constants';
import { FeedbackService } from '@/lib/services/feedback.service';
import { feedbackFilterSchema } from '@/lib/validations/feedback';
import { Link } from '@/i18n/routing';
import FeedbackAdminRow from '@/components/admin/FeedbackAdminRow';
import FeedbackPurgeButton from '@/components/admin/FeedbackPurgeButton';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

import { Input, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('feedback') };
}


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

    const { userId } = await requireAdminPage(locale, '/admin/feedback');

    const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
    const filter = feedbackFilterSchema.parse({ kind: first(raw.kind), tab: first(raw.tab), page: first(raw.page) });
    const notes = await FeedbackService.list(userId, filter).catch(() => []);
    const counts = await FeedbackService.counts(userId).catch(() => ({ open: 0, completed: 0 }));
    const tab = filter.tab ?? 'open';

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />

            <nav aria-label={t('tabs')} className="mb-6 flex border-b border-border">
                {FEEDBACK_TABS.map((id) => (
                    <Link
                        key={id}
                        href={id === 'open' ? '/admin/feedback' : `/admin/feedback?tab=${id}`}
                        aria-current={tab === id ? 'page' : undefined}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-button transition-colors ${tab === id ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
                    >
                        {t(`tab.${id}`)}
                        <span className={`rounded-pill px-2 py-0.5 text-tag ${tab === id ? 'bg-primary/10 text-primary' : 'bg-border/50 text-foreground-muted'}`}>{counts[id]}</span>
                    </Link>
                ))}
            </nav>

            {/* A plain GET form: filters live in the URL, no client code needed. */}
            <form method="get" className="mb-6 flex flex-wrap items-center gap-2">
                <input type="hidden" name="tab" value={tab} />
                <Select name="kind" defaultValue={filter.kind ?? ''} aria-label={t('filterKind')}>
                    <option value="">{t('allKinds')}</option>
                    {FEEDBACK_KINDS.map((k) => <option key={k} value={k}>{tMode(`kind.${k}`)}</option>)}
                </Select>
                <Input name="page" defaultValue={filter.page ?? ''} placeholder={t('filterPage')} aria-label={t('filterPage')} className="w-full sm:w-56" />
                <Button type="submit">{t('filter')}</Button>
                {tab === 'completed' && counts.completed > 0 && (
                    <div className="sm:ml-auto"><FeedbackPurgeButton count={counts.completed} /></div>
                )}
            </form>

            {notes.length === 0 ? (
                <p className="rounded-2xl line bg-surface p-6 text-body-sm text-foreground-muted shadow-card">{t('empty')}</p>
            ) : (
                <>
                    <p className="mb-3 text-body-sm text-foreground-muted">{t('count', { count: notes.length })}</p>
                    <ul className="space-y-3">
                        {notes.map((note) => <FeedbackAdminRow key={note.id} note={note} />)}
                    </ul>
                </>
            )}
        </div>
    );
}
