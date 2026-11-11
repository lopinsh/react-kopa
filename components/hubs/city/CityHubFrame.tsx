import { getTranslations } from 'next-intl/server';
import type { CityHubContext } from '@/lib/services/city-hub.service';
import { CityHubProvider } from '@/components/providers/CityHubProvider';
import FrameColumns from '@/components/ui/FrameColumns';
import { CityHead, CityPagesNav, CityStickyBar } from './CityFrameParts';

/**
 * The frame of a city hub (K3-17), mirroring the topic hub's: head tile, pages down the left (a ☰ drawer on phones), the page beside them.
 * No Tēma, so `--accent` is the site's primary, set here so the first paint is right (Taxonomy Law).
 */
export default async function CityHubFrame({ city, locale, children }: { city: CityHubContext; locale: string; children: React.ReactNode }) {
    const t = await getTranslations({ locale, namespace: 'hub.city' });
    return (
        <CityHubProvider value={{ name: t('name', { city: city.name }), cityName: city.name, href: city.href, stats: city.stats }}>
            <style dangerouslySetInnerHTML={{ __html: ':root{--accent:var(--primary);--accent-foreground:var(--primary-foreground)}@media(max-width:1023px){:root{--sticky-bar:2.5rem}}' }} />
            <CityStickyBar />
            <CityHead />
            <FrameColumns navFrom="lg" wide nav={<CityPagesNav variant="side" />}>
                {children}
            </FrameColumns>
        </CityHubProvider>
    );
}
