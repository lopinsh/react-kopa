import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { CityHubService } from '@/lib/services/city-hub.service';
import CityOverviewPage from '@/components/hubs/city/CityOverviewPage';

type Params = { locale: string; l1Slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, l1Slug } = await params;
    const city = await CityHubService.getContext(l1Slug, locale);
    if (!city) return {};
    const t = await getTranslations({ locale, namespace: 'hub.city' });
    return { title: t('name', { city: city.name }) };
}

/** Pārskats of the city hub at `/lv/<city>` (K3-15). No page exists at a Tēma's address, so anything but a city is a 404. */
export default async function CityPage({ params }: { params: Promise<Params> }) {
    const { locale, l1Slug } = await params;
    const [city, session] = await Promise.all([CityHubService.getContext(l1Slug, locale), auth()]);
    if (!city) notFound();
    return <CityOverviewPage city={city} locale={locale} viewer={session?.user?.id ? { id: session.user.id, role: session.user.role } : undefined} />;
}
