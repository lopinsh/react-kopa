import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Download, Languages } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { MessageOverrideService } from '@/lib/services/message-override.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('translations') };
}

export default async function AdminTranslationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.translations');
    const format = await getFormatter();

    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/admin/translations'));
    if (session.user.role !== 'ADMIN') notFound();

    const result = await MessageOverrideService.listOverrides(session.user.id);
    const rows = result.success ? result.data ?? [] : [];

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Languages className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                        <p className="mt-1 text-foreground-muted">{t('subtitle')}</p>
                    </div>
                </div>
                {/* A plain link: the route sends the file as a download. */}
                <a
                    href="/api/admin/translations/export"
                    download
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                >
                    <Download className="h-4 w-4" />
                    {t('export')}
                </a>
            </div>

            {rows.length === 0 ? (
                <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-foreground-muted">{t('empty')}</p>
            ) : (
                <>
                    <p className="mb-3 text-sm font-semibold text-foreground-muted">{t('count', { count: rows.length })}</p>
                    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead className="border-b border-border text-xs uppercase tracking-wide text-foreground-muted">
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
                                        <td className="break-all px-4 py-3 font-mono text-xs">{row.key}</td>
                                        <td className="px-4 py-3 uppercase">{row.lang}</td>
                                        <td className="px-4 py-3">{row.value}</td>
                                        <td className="px-4 py-3 text-foreground-muted">{row.updatedBy ?? ''}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">{format.dateTime(row.updatedAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Riga' })}</td>
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
