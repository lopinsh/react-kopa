import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import GroupCreationWizard from '@/components/groups/create-wizard/GroupCreationWizard';
import { auth } from '@/lib/auth';
import { CityService } from '@/lib/services/city.service';
import { CitiesProvider } from '@/components/providers/CitiesContext';
import { redirect } from 'next/navigation';
import { signInUrl } from '@/lib/auth-redirect';
import { isSiteAdmin } from '@/lib/site-role';
import { isUnsplashSearchEnabled } from '@/lib/services/unsplash.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'common' });
    return { title: t('createGroup') };
}

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
        redirect(signInUrl(locale, '/create'));
    }

    const [taxonomyResponse, cities] = await Promise.all([getTaxonomy(locale), CityService.listActive(locale)]);
    const taxonomy = taxonomyResponse.success ? (taxonomyResponse.data ?? []) : [];

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <CitiesProvider cities={cities}>
                <GroupCreationWizard taxonomy={taxonomy} initialL1Slug={category} searchEnabled={isUnsplashSearchEnabled()} canEditUrl={isSiteAdmin(session.user.role)} />
            </CitiesProvider>
        </div>
    );
}
