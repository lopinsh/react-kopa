import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getAllTags, getPendingTags, getTaxonomy } from '@/actions/taxonomy-actions';
import { getTranslations } from 'next-intl/server';
import TaxonomyAdminClient from './TaxonomyAdminClient';

export default async function AdminTaxonomyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('group.admin');

    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/api/auth/signin`);
    }

    if (session.user.role !== 'ADMIN') {
        notFound();
    }

    const [pendingRes, allRes, treeRes] = await Promise.all([getPendingTags(), getAllTags(), getTaxonomy(locale)]);

    if (!pendingRes.success || !allRes.success || !treeRes.success) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t('taxonomy.title')}</h1>
            </div>
            <TaxonomyAdminClient
                locale={locale}
                pending={pendingRes.data ?? []}
                categories={allRes.data ?? []}
                tree={treeRes.data ?? []}
            />
        </div>
    );
}
