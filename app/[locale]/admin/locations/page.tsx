import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { CityService } from '@/lib/services/city.service';
import CitiesSection from './CitiesSection';
import PendingCityCard from './PendingCityCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('locations') };
}

/** Cities: the ones waiting for review, then the approved list. */
export default async function AdminLocationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.taxonomy');
    const tNav = await getTranslations('admin.nav');

    await requireAdminPage(locale, '/admin/locations');

    const cities = await CityService.listAll();
    const pending = cities.filter((city) => city.status === 'PENDING_REVIEW');

    return (
        <div className="space-y-6">
            <AdminPageHeader title={tNav('locations')} />
            <div className="space-y-6">
                {pending.length > 0 && (
                    <section aria-labelledby="locations-pending" className="grid gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-5">
                        <h2 id="locations-pending" className="text-item text-warning">{t('inbox.title')}</h2>
                        {pending.map((city) => (
                            <PendingCityCard key={city.id} city={city} />
                        ))}
                    </section>
                )}
                <CitiesSection cities={cities} />
            </div>
        </div>
    );
}
