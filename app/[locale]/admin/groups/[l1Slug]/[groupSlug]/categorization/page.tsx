import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin-access';
import { notFound } from 'next/navigation';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import { GroupService } from '@/lib/services/group.service';
import AdminGroupCategorizationForm from './AdminGroupCategorizationForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.taxonomy' });
    return { title: t('override.title') };
}

export default async function AdminGroupCategorizationPage({
    params,
}: {
    params: Promise<{ locale: string; l1Slug: string; groupSlug: string }>;
}) {
    const { locale, l1Slug, groupSlug } = await params;

    const { userId } = await requireAdminPage(locale, `/admin/groups/${l1Slug}/${groupSlug}/categorization`);

    const [taxonomyRes, group] = await Promise.all([
        getTaxonomy(locale),
        GroupService.getGroupWithContext(groupSlug, locale, l1Slug, userId),
    ]);

    if (!taxonomyRes.success || !group) {
        notFound();
    }

    const taxonomy = taxonomyRes.data ?? [];
    const selectedL1 = taxonomy.find((l1) => l1.slug === group.category.l1Slug || l1.id === group.category.id) ?? null;

    if (!selectedL1) {
        notFound();
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <AdminGroupCategorizationForm
                locale={locale}
                groupId={group.id}
                groupSlug={group.slug}
                l1Slug={group.category.l1Slug}
                groupName={group.name}
                selectedL1={selectedL1}
                initialTagIds={group.tags.map((tag) => tag.id)}
            />
        </div>
    );
}
