import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import { GroupService } from '@/lib/services/group.service';
import AdminGroupCategorizationForm from './AdminGroupCategorizationForm';

export default async function AdminGroupCategorizationPage({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string }>;
}) {
    const { locale, groupSlug } = await params;

    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/api/auth/signin`);
    }

    if (session.user.role !== 'ADMIN') {
        notFound();
    }

    const [taxonomyRes, group] = await Promise.all([
        getTaxonomy(locale),
        GroupService.getGroupWithContext(groupSlug, locale, undefined, session.user.id),
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
