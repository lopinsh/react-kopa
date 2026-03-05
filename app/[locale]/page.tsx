import { GroupService } from '@/lib/services/group.service';
import { DiscoveryService } from '@/lib/services/discovery.service';
import { EventService } from '@/lib/services/event.service';
import { getGroups, getDiscoveryCategories, snapInterest, getContextualTaxonomy } from '@/actions/discovery-actions';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import DiscoveryFilterBarWrapper from '@/components/discovery/DiscoveryFilterBarWrapper';
import ListViewCard from '@/components/discovery/ListViewCard';
import GroupCard from '@/components/discovery/GroupCard';
import EventCard from '@/components/discovery/EventCard';
import InfiniteScrollTrigger from '@/components/discovery/InfiniteScrollTrigger';
import DiscoverySidebar from '@/components/discovery/DiscoverySidebar';
import { getTranslations } from 'next-intl/server';
import { Users, Search, Plus, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale } = await params;
    const { city, category, q } = await searchParams;

    let title = 'Discover Groups';
    const t = await getTranslations({ locale, namespace: 'discovery' });

    if (q) {
        title = `"${q}"`;
    } else if (category) {
        const displayName = await DiscoveryService.getCategoryDisplayName(category, locale);
        title = displayName || category.charAt(0).toUpperCase() + category.slice(1);
    }

    if (city && city !== 'all') {
        title += ` ${t('inCity')} ${city}`;
    }

    return {
        title,
        description: 'Find groups and communities near you for sports, hobbies, and social activities.',
    };
}

import { CITIES } from '@/lib/constants';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string; city?: string; category?: string; tags?: string; view?: 'grid' | 'list'; type?: string; limit?: string; tab?: 'groups' | 'events' }>;
};

export default async function DiscoveryPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { q, city, category, tags: tagsParam, view, type, limit, tab } = await searchParams;
    const activeTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
    const currentTab = tab === 'events' ? 'events' : 'groups';
    const currentView = view === 'list' ? 'list' : 'grid';
    const t = await getTranslations('discovery');

    const rawLimit = Math.max(12, parseInt(limit as string || '12'));
    const take = rawLimit;
    const skip = 0; // Always start from 0 to simulate lazy load with server component

    const [categories, taxonomyRes, catRecord, snap] = await Promise.all([
        getDiscoveryCategories(locale),
        getTaxonomy(locale),
        category ? GroupService.findCategoryBySlug(category) : Promise.resolve(null),
        (q && !category) ? snapInterest(q, locale) : Promise.resolve(null)
    ]);

    if (!taxonomyRes.success) {
        throw new Error('FAILED_TO_LOAD_TAXONOMY');
    }
    const fullTaxonomy = taxonomyRes.data!;

    // Interest Snapping
    let effectiveCategoryId = undefined;

    if (category && catRecord) {
        effectiveCategoryId = catRecord.id;
    }

    let l1HighlightId = effectiveCategoryId;

    if (q && !category && snap) {
        effectiveCategoryId = snap.id;
        l1HighlightId = snap.l1Id ?? snap.id;
    }

    const [groupsRes, discoverableEvents, taxonomy] = await Promise.all([
        getGroups({
            query: q,
            city,
            categoryId: effectiveCategoryId,
            tags: activeTags,
            type: type as string | undefined,
            take: currentTab === 'groups' ? take : 0,
            skip
        }, locale),
        currentTab === 'events'
            ? EventService.getDiscoverableEvents({
                category: category,
                city,
                search: q,
                status: 'upcoming'
            }, locale)
            : Promise.resolve([]),
        getContextualTaxonomy(effectiveCategoryId || null, locale)
    ]);

    const { groups, hasMore, totalCount } = groupsRes;

    // Dynamic accent color based on selected or snapped hierarchy
    const activeL1 = taxonomy ? taxonomy.l1 : categories.find(c => c.id === l1HighlightId);
    const accentColor = activeL1?.color || '#6366f1';
    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

    return (
        <div style={accentStyle} className="flex min-h-full">
            {/* Discovery Sidebar */}
            <DiscoverySidebar
                categories={categories}
                activeCat={category}
                locale={locale}
            />

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 pb-20 pt-4">
                <div className="px-4 max-w-6xl mx-auto w-full">
                    <DiscoveryFilterBarWrapper
                        taxonomy={fullTaxonomy}
                        activeCat={category}
                        activeTags={activeTags}
                        initialQuery={q}
                        locale={locale}
                        currentView={currentView}
                    />

                    <div className="mb-4 mt-6 flex items-center gap-4 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                            {currentTab === 'groups' ? totalCount : discoverableEvents.length} {currentTab === 'groups' ? t('groupsFound') : t('eventsFound')}
                        </h2>
                        {(q || (city && city !== 'all') || category || activeTags.length > 0) && (
                            <Link
                                href="/"
                                className="text-xs font-bold text-[var(--accent)] hover:opacity-70 transition-opacity underline decoration-dotted underline-offset-4"
                            >
                                {t('clearAll')}
                            </Link>
                        )}
                    </div>

                    {/* Results Grid / List */}
                    {currentTab === 'groups' ? (
                        groups.length > 0 ? (
                            currentView === 'grid' ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {groups.map((group) => (
                                        <GroupCard
                                            key={group.id}
                                            group={group as any}
                                            accentColor={accentColor}
                                            locale={locale}
                                        />
                                    ))}
                                    {effectiveCategoryId && (
                                        <Link
                                            href={`/create?category=${activeL1?.slug || ''}`}
                                            className="group relative flex flex-col items-center justify-center h-full min-h-[280px] rounded-[20px] bg-surface-elevated text-foreground border-2 border-dashed border-border/60 transition-transform duration-200 ease-out hover:border-[var(--accent)] hover:bg-surface hover:scale-[1.02] soft-press"
                                            style={{ ['--accent' as string]: accentColor }}
                                        >
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background mb-4 text-foreground-muted group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-colors shadow-sm">
                                                    <Plus className="h-7 w-7" />
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground">{t('createNewGroup')}</h3>
                                                <p className="mt-1 text-sm text-foreground-muted">{t('inThisCategory')}</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {groups.map((group) => (
                                        <ListViewCard
                                            key={group.id}
                                            group={group as any}
                                            accentColor={accentColor}
                                            locale={locale}
                                        />
                                    ))}
                                </div>
                            )
                        ) : null
                    ) : (
                        discoverableEvents.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {discoverableEvents.map((event) => {
                                    const group = (event as any).group;
                                    let eventL1Slug = group.category.slug;
                                    if (group.category.level === 3 && group.category.parent?.parent) {
                                        eventL1Slug = group.category.parent.parent.slug;
                                    } else if (group.category.level === 2 && group.category.parent) {
                                        eventL1Slug = group.category.parent.slug;
                                    }

                                    return (
                                        <EventCard
                                            key={event.id}
                                            event={event as any}
                                            locale={locale}
                                            l1Slug={eventL1Slug}
                                            groupSlug={group.slug}
                                            accentColor={group.accentColor || accentColor}
                                        />
                                    );
                                })}
                            </div>
                        ) : null
                    )}

                    {/* Empty State Logic */}
                    {((currentTab === 'groups' && groups.length === 0) || (currentTab === 'events' && discoverableEvents.length === 0)) && (
                        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-surface-elevated/30 py-24 text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted opacity-40 mb-2">
                                <Search className="h-10 w-10" />
                            </div>
                            <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground">
                                {currentTab === 'groups' ? t('noGroupsFound') : t('noEventsFound')}
                            </h2>
                            <p className="mt-3 text-lg text-foreground-muted max-w-sm mx-auto">
                                {t('adjustFilters')}
                            </p>
                        </div>
                    )}

                    {/* Lazy Load Action */}
                    <InfiniteScrollTrigger
                        hasMore={hasMore}
                        currentLimit={take}
                        increment={12}
                    />
                </div>
            </main>
        </div>
    );
}
