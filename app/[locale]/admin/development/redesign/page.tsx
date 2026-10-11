import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTimeZone, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { isSiteAdmin } from '@/lib/site-role';
import { createDateFormatter } from '@/lib/date-format';
import { decorateRedesign } from '@/lib/development/redesign-html';
import { DevelopmentService } from '@/lib/services/development.service';
import RedesignReview from '@/components/development/RedesignReview';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('redesign') };
}

/**
 * The redesign discussion (discussion only, nothing is built from it). It compares looks, so it carries its own
 * colours and fonts (scoped under `.rd`) and does not follow the site theme chosen in Admin > Design.
 */
export default async function RedesignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/admin/development/redesign'));
    if (!isSiteAdmin(session.user.role)) notFound();

    const t = await getTranslations('admin.development');
    const format = createDateFormatter(await getLocale(), await getTimeZone());
    const { html, meta } = await DevelopmentService.getRedesign();

    const decorated = decorateRedesign(html, meta, {
        version: t('version', { version: meta.version }),
        updated: t('updated', { date: format.dateTime(new Date(meta.updated), { dateStyle: 'medium', timeStyle: 'short' }) }),
        changesTitle: t('changesTitle'),
        markAll: t('markAll'),
        badgeNew: t('badgeNew'),
        badgeUpdated: t('badgeUpdated'),
        badgeHint: t('badgeHint'),
    });
    const sections = Object.entries(meta.sections).map(([id, s]) => ({ id, version: s.version }));

    return (
        <RedesignReview sections={sections}>
            <div dangerouslySetInnerHTML={{ __html: decorated }} />
        </RedesignReview>
    );
}
