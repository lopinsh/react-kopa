import { notFound } from 'next/navigation';
import { redirect } from '@/i18n/routing';
import { isSiteAdmin } from '@/lib/site-role';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { hubPages } from '@/lib/hub-pages';
import { parseHubPath } from '@/lib/hub-path';
import { HubService } from '@/lib/services/hub.service';
import { CityHubService } from '@/lib/services/city-hub.service';
import { HubCityService } from '@/lib/services/hub-city.service';
import { HubProvider } from '@/components/providers/HubProvider';
import FrameColumns from '@/components/ui/FrameColumns';
import HubHead from '@/components/hubs/frame/HubHead';
import HubStickyBar from '@/components/hubs/frame/HubStickyBar';
import HubPagesNav from '@/components/hubs/frame/HubPagesNav';
import HubRequestFromUrl from '@/components/hubs/frame/HubRequestFromUrl';

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
    // A city hub's Grupas, Pasākumi and Ziņas: the city frame (the `[l1Slug]` layout) is the whole frame (K3-15).
    if (await CityHubService.getContext(l1Slug, locale)) return children;
    const address = parseHubPath(segments);
    if (!address) notFound();
    const hub = await HubService.getHubContext(l1Slug, address.l2Slug, address.middle.join('/'), locale);
    if (!hub) notFound();
    // A city without an open hub: the topic hub, same page, with the request sheet (K3-08).
    if (hub.unopenedCity) redirect({ href: `${hubPages(hub.topicHref).find((x) => x.key === address.page)?.href ?? hub.topicHref}?request=${hub.unopenedCity}`, locale });

    const [session, t] = await Promise.all([auth(), getTranslations({ locale, namespace: 'hub' })]);
    const kur = await HubCityService.kurOptions({ id: hub.id, l1Id: hub.l1Id, slug: hub.slug }, locale, session?.user?.id);

    return (
        <HubProvider value={{
            slug: hub.slug,
            name: hub.local ? t('localName', { name: t('name', { title: hub.title }), city: hub.local.cityName }) : t('name', { title: hub.title }),
            title: hub.title,
            href: hub.href,
            l1Slug: hub.l1Slug,
            path: hub.path,
            stats: hub.stats,
            subTopics: hub.subTopics,
            image: hub.image?.url ?? null,
            topicHref: hub.topicHref,
            local: hub.local && { hubCityId: hub.local.hubCityId, citySlug: hub.local.citySlug, segment: hub.local.segment, cityName: hub.local.cityName, cityHref: hub.local.cityHref },
            kur,
            signedIn: !!session?.user,
            isAdmin: isSiteAdmin(session?.user?.role),
        }}>
            {/* var(--cat-<l1Slug>) or a validated hex from TaxonomyResolver: safe inside <style>. Light/dark come from the site theme. */}
            <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${hub.theme.accentColor};--accent-foreground:var(--on-cat)}@media(max-width:1023px){:root{--sticky-bar:2.5rem}}` }} />
            <HubStickyBar />
            <HubHead />
            <HubRequestFromUrl />
            <FrameColumns navFrom="lg" wide nav={<HubPagesNav variant="side" />}>
                {children}
            </FrameColumns>
        </HubProvider>
    );
}
