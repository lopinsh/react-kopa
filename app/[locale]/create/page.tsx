import { getTaxonomy } from '@/actions/taxonomy-actions';
import GroupCreationWizard from '@/components/forms/GroupCreationWizard';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CreateGroupPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const session = await auth();
    const { locale } = await params;
    const { category } = await searchParams;

    if (!session?.user) {
        redirect(`/${locale}/api/auth/signin`);
    }

    const taxonomyResponse = await getTaxonomy(locale);
    const taxonomy = taxonomyResponse.success ? (taxonomyResponse.data ?? []) : [];

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <GroupCreationWizard taxonomy={taxonomy} initialL1Slug={category} />
        </div>
    );
}
