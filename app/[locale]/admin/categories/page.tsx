import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin-access';
import { notFound } from 'next/navigation';
import { getAllTags, getPendingTags, getTaxonomy } from '@/actions/taxonomy-actions';
import { getTranslations } from 'next-intl/server';
import TaxonomyAdminClient from './TaxonomyAdminClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('categories') };
}

export default async function AdminTaxonomyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('admin.taxonomy');

    await requireAdminPage(locale, '/admin/categories');

    const [pendingRes, allRes, treeRes] = await Promise.all([getPendingTags(), getAllTags(), getTaxonomy(locale)]);

    if (!pendingRes.success || !allRes.success || !treeRes.success) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
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
