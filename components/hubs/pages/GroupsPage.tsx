import { Plus, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { HUB_GROUP_TIERS } from '@/lib/constants';
import { discoveryHref, parseDiscoveryParams } from '@/lib/discovery-params';
import { hubPages } from '@/lib/hub-pages';
import { HubService, type HubContext } from '@/lib/services/hub.service';
import GroupList from '@/components/discovery/GroupList';
import GroupRow from '@/components/discovery/GroupRow';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/Button';
import HubTabs from '@/components/hubs/HubTabs';

/**
 * Grupas of a hub (K1-09..11): tabs Visas / Jaunās with Kur at the end, then the groups by tier (K-106):
 * 1-4 as cards (rows below md, as the board), 5-16 as compact rows in one box, more: the first 16 and a link to the board with the Veids and Kur set.
 */
export default async function GroupsPage({ hub, cities, tab, locale, viewerId }: { hub: HubContext; cities: string[]; tab: 'all' | 'new'; locale: string; viewerId?: string }) {
    const [t, { groups, total, activity, faces, myRoles }] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        HubService.getGroups(hub, { cities, tab, take: HUB_GROUP_TIERS.list }, locale, viewerId),
    ]);
    const groupsHref = hubPages(hub.href).find((p) => p.key === 'groups')?.href ?? hub.href;
    const items = [
        { key: 'all', label: t('groups.tabAll'), href: groupsHref },
        { key: 'new', label: t('groups.tabNew'), href: `${groupsHref}${groupsHref.includes('?') ? '&' : '?'}tab=new` },
    ];
    const more = total - groups.length;

    return (
        <>
            <HubTabs label={t('groups.tabsLabel')} items={items} active={tab} />
            {groups.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={t('groups.empty')}
                    action={<Link href={`/create?category=${hub.l1Slug}&tag=${hub.slug}`} className={buttonClass('primary')}><Plus aria-hidden className="size-4" />{t('actions.createGroup')}</Link>}
                />
            ) : total <= HUB_GROUP_TIERS.full ? (
                <GroupList groups={groups} activity={activity} faces={faces} myRoles={myRoles} />
            ) : (
                <div className="grid gap-3">
                    <div className="rounded-2xl bg-surface px-4 shadow-card frame">
                        {groups.map((g) => <GroupRow key={g.id} group={g} activity={activity[g.id]} fullPage={!!myRoles[g.id]} role={myRoles[g.id]} showMember />)}
                    </div>
                    {more > 0 && (
                        <Link href={discoveryHref(parseDiscoveryParams(new URLSearchParams()), { category: hub.l1Slug, tags: [hub.slug], cities })} className={buttonClass('quiet', 'justify-self-center')}>
                            {t('groups.more', { n: more })}
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
