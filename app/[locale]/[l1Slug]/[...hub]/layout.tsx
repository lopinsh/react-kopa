import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { parseHubPath } from '@/lib/hub-path';
import { HubService } from '@/lib/services/hub.service';
import { CityService } from '@/lib/services/city.service';
import { HubProvider } from '@/components/providers/HubProvider';
import FrameColumns from '@/components/ui/FrameColumns';
import HubHead from '@/components/hubs/frame/HubHead';
import HubStickyBar from '@/components/hubs/frame/HubStickyBar';
import HubPagesNav from '@/components/hubs/frame/HubPagesNav';

/**
 * The frame of a hub (a Veids or sub-veids, K1): the head tile, the pages down the left (a ☰ drawer on phones) and the page beside them, with no side column
 * (the panels use the width, K-91). `--accent` is set here from the Tēma, so the first paint is already right (Taxonomy Law).
 */
export default async function HubLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; l1Slug: string; hub: string[] }>;
}) {
    const { locale, l1Slug, hub: segments } = await params;
    const address = parseHubPath(segments);
    if (!address) notFound();
    const hub = await HubService.getHubContext(l1Slug, address.l2Slug, address.l3Slug, locale);
    if (!hub) notFound();

    const [session, t, cities, cityCounts] = await Promise.all([
        auth(),
        getTranslations({ locale, namespace: 'hub' }),
        CityService.listActive(locale),
        HubService.getCityCounts(hub, locale),
    ]);

    return (
        <HubProvider value={{
            slug: hub.slug,
            name: t('name', { title: hub.title }),
            title: hub.title,
            href: hub.href,
            l1Slug: hub.l1Slug,
            path: hub.path,
            stats: hub.stats,
            subTopics: hub.subTopics,
            cities,
            cityCounts,
            signedIn: !!session?.user,
        }}>
            {/* var(--cat-<l1Slug>) or a validated hex from TaxonomyResolver: safe inside <style>. Light/dark come from the site theme. */}
            <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${hub.theme.accentColor};--accent-foreground:var(--on-cat)}@media(max-width:1023px){:root{--sticky-bar:2.5rem}}` }} />
            <HubStickyBar />
            <HubHead />
            <FrameColumns navFrom="lg" nav={<HubPagesNav variant="side" />}>
                {children}
            </FrameColumns>
        </HubProvider>
    );
}
