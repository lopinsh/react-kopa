import type { Metadata } from 'next';
import { getPendingWildcards, approveWildcard, rejectWildcard } from '@/actions/admin-actions';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ShieldAlert, Check, X } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { signInUrl } from '@/lib/auth-redirect';
import { getFormatter } from 'next-intl/server';
import { ModerationService } from '@/lib/services/moderation.service';
import type { ActionResponse } from '@/types/actions';
import HiddenGroupActions from '@/components/admin/HiddenGroupActions';
import { EVENT_TIME_ZONE } from '@/lib/constants';

/** Returns an inline admin form action to its tab; a failure is shown via ?error=CODE. */
function backToTab(locale: string, tabName: string, res: ActionResponse): never {
    redirect(`/${locale}/admin?tab=${tabName}${res.success ? '' : `&error=${res.error}`}`);
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tab?: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { tab } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    const tDash = await getTranslations({ locale, namespace: 'admin.dashboard' });
    return { title: tab === 'moderation' ? t('moderation') : tDash('title') };
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
    // Reports have their own page (the "Reports" tab of the admin navigation).
    if (tab === 'reports') redirect(`/${locale}/admin/reports`);
    const activeTab = tab === 'moderation' ? 'moderation' : 'tags';
    const t = await getTranslations('admin.dashboard');
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

    const [moderationLog, hiddenGroups] = activeTab === 'moderation'
        ? await Promise.all([ModerationService.listActions(50, group), ModerationService.listHiddenGroups()])
        : [[], []];

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    {t('title')}
                </h1>
                <p className="text-foreground-muted mt-2">{t('subtitle')}</p>
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
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{tMod('hiddenGroupsTitle')}</h2>
                        {hiddenGroups.length === 0 ? (
                            <p className="mb-10 text-foreground-muted text-center py-8">{tMod('hiddenGroupsEmpty')}</p>
                        ) : (
                            <ul className="mb-10 space-y-3">
                                {hiddenGroups.map(g => (
                                    <li key={g.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <Link href={`/${locale}${g.href}`} className="font-bold text-primary hover:underline [overflow-wrap:anywhere]">{g.name}</Link>
                                            <p className="text-sm text-foreground-muted">{g.ownerName ? tMod('hiddenOwner', { name: g.ownerName }) : tInbox('unknown')}</p>
                                            <p className="text-sm text-foreground [overflow-wrap:anywhere]">{g.reason || '—'}</p>
                                            <p className="text-xs text-foreground-muted">
                                                {tMod('hiddenBy', { name: g.hiddenByName || tInbox('unknown'), date: format.dateTime(g.hiddenAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: EVENT_TIME_ZONE }) })}
                                            </p>
                                        </div>
                                        <HiddenGroupActions groupId={g.id} groupName={g.name} />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <h2 className="text-xl font-semibold mb-4 text-foreground">{tMod('logTitle')}</h2>
                        {group && (
                            <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
                                {tMod('logFiltered')}
                                <Link href={`/${locale}/admin?tab=moderation`} className="font-semibold text-primary hover:underline">{tMod('logShowAll')}</Link>
                            </p>
                        )}
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
                                                    {format.dateTime(entry.createdAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: EVENT_TIME_ZONE })}
                                                </td>
                                                <td className="py-3 pr-4">{entry.adminName || tInbox('unknown')}</td>
                                                <td className="py-3 pr-4 font-medium">{tMod(`action_${entry.action}`)}</td>
                                                <td className="py-3 pr-4">
                                                    {entry.target ? (
                                                        <Link href={`/${locale}${entry.target.href}`} className="text-primary hover:underline">{entry.target.name}</Link>
                                                    ) : (
                                                        <span className="text-foreground-muted [overflow-wrap:anywhere]">
                                                            {entry.targetName ? `${entry.targetName} ${tMod('deletedTarget')}` : tMod('deletedTarget')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 max-w-md break-words text-foreground-muted [overflow-wrap:anywhere]">{entry.reason || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

