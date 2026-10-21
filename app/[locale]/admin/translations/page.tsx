import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { getTranslations, getLocale, getTimeZone } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import SuggestionRow from '@/components/admin/SuggestionRow';
import { MessageOverrideService } from '@/lib/services/message-override.service';
import { createDateFormatter } from '@/lib/date-format';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { buttonClass } from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('translations') };
}

export default async function AdminTranslationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.translations');
    const format = createDateFormatter(await getLocale(), await getTimeZone());

    const { userId } = await requireAdminPage(locale, '/admin/translations');

    const rows = await MessageOverrideService.listOverrides(userId).catch(() => []);
    const suggestions = await MessageOverrideService.listSuggestions(userId).catch(() => []);

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} action={
                <a
                    href="/api/admin/translations/export"
                    download
                    className={buttonClass('primary')}
                >
                    <Download className="size-4" />
                    {t('export')}
                </a>
            } />

            <section aria-labelledby="suggestions-heading" className="mb-10">
                <h2 id="suggestions-heading" className="mb-3 text-section text-foreground">{t('suggestionsTitle')}</h2>
                {suggestions.length === 0 ? (
                    <p className="rounded-2xl line bg-surface p-6 text-body-sm text-foreground-muted shadow-card">{t('suggestionsEmpty')}</p>
                ) : (
                    <ul className="space-y-3">
                        {suggestions.map((s) => (
                            <SuggestionRow
                                // A replaced suggestion keeps its id; keying on the text too resets the row's error state.
                                key={`${s.id}:${s.value}`}
                                id={s.id}
                                messageKey={s.key}
                                lang={s.lang}
                                current={s.current}
                                value={s.value}
                                by={s.createdBy ?? '—'}
                                when={format.dateTime(s.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                            />
                        ))}
                    </ul>
                )}
            </section>

            <h2 className="mb-3 text-section text-foreground">{t('liveTitle')}</h2>
            {rows.length === 0 ? (
                <p className="rounded-2xl line bg-surface p-6 text-body-sm text-foreground-muted shadow-card">{t('empty')}</p>
            ) : (
                <>
                    <p className="mb-3 text-body-sm text-foreground-muted">{t('count', { count: rows.length })}</p>
                    <div className="overflow-x-auto rounded-2xl line bg-surface shadow-card">
                        <table className="w-full min-w-[40rem] text-left text-body-sm">
                            <thead className="border-b border-border text-meta text-foreground-muted">
                                <tr>
                                    <th className="px-4 py-3">{t('key')}</th>
                                    <th className="px-4 py-3">{t('language')}</th>
                                    <th className="px-4 py-3">{t('text')}</th>
                                    <th className="px-4 py-3">{t('by')}</th>
                                    <th className="px-4 py-3">{t('when')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={`${row.key}:${row.lang}`} className="border-b border-border/60 last:border-0">
                                        <td className="break-all px-4 py-3 font-mono text-meta">{row.key}</td>
                                        <td className="px-4 py-3">{row.lang}</td>
                                        <td className="px-4 py-3">{row.value}</td>
                                        <td className="px-4 py-3 text-foreground-muted">{row.updatedBy ?? ''}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">{format.dateTime(row.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
