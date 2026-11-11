import { CityHubService } from '@/lib/services/city-hub.service';
import CityHubFrame from '@/components/hubs/city/CityHubFrame';

/**
 * `/lv/<city>` is a city hub (K3-15): no main category owns the segment, so the first address part may be a city. Then the city hub's frame wraps its pages
 * (Pārskats here, Grupas, Pasākumi and Ziņas in the `[...hub]` catch-all); any other first part (a Tēma's hubs, a group) passes through untouched.
 */
export default async function L1Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string; l1Slug: string }> }) {
    const { locale, l1Slug } = await params;
    const city = await CityHubService.getContext(l1Slug, locale);
    if (!city) return children;
    return <CityHubFrame city={city} locale={locale}>{children}</CityHubFrame>;
}
