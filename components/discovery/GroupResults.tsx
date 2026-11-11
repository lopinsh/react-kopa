import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import GroupList from './GroupList';
import CreateCard from './CreateCard';
import HubCard from './HubCard';
import { HubService } from '@/lib/services/hub.service';
import EmptyState from '@/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import { DISCOVERY_GROUPS_MAX, DISCOVERY_GROUPS_PAGE } from '@/lib/constants';
import type { MembershipRole } from '@prisma/client';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { Face } from '@/lib/services/event-panel';

type Props = {
    groups: GroupCardData[];
    hasMore: boolean;
    activity: Record<string, CardActivity>;
    /** Group id → faces for the cards' pictures (signed-in viewers only). */
    faces?: Record<string, Face[]>;
    params: DiscoveryParams;
    /** Group id → the viewer's role in the groups they belong to or wait for: those open as full pages and carry a role tag. */
    myRoles?: Record<string, MembershipRole>;
    locale: string;
};

/** The Grupas list: the cards or rows, "Rādīt vēl" when more are left, the create card at the true end of a chosen category (also when it is empty). */
export default async function GroupResults({ groups, hasMore, activity, faces, params, myRoles, locale }: Props) {
    const t = await getTranslations('discovery');
    const createFor = params.category && !hasMore ? params.category : null;
    const canAskMore = hasMore && params.limit < DISCOVERY_GROUPS_MAX;

    // The hub card (K1-26): only with a Tēma and at least one Veids chosen (an L1 alone has no hub, K-06).
    const hubs = params.category && params.tags.length > 0 ? await HubService.getSummary(params.category, params.tags, locale, params.cities.length === 1 ? params.cities[0] : undefined, groups.length === 0) : [];
    const lead = hubs.length > 0 && params.category
        ? { card: <HubCard hubs={hubs} l1Slug={params.category} locale={locale} variant="card" />, row: <HubCard hubs={hubs} l1Slug={params.category} locale={locale} variant="row" /> }
        : undefined;

    const city = hubs.find((h) => h.kind === 'city');
    if (groups.length === 0 && lead && city) {
        // Kur is one city with no groups (K-137): the hub card keeps the grid's first cell, the line says why the rest is empty.
        return (
            <>
                <GroupList lead={lead} groups={[]} createFor={createFor} filters={params} />
                <p className="mt-5 text-center text-body-sm text-foreground-muted">{t('noGroupsInCity', { city: city.title })}</p>
            </>
        );
    }
    if (groups.length === 0) {
        return (
            <>
                {lead && <><div className="mx-auto mb-4 hidden max-w-sm md:block">{lead.card}</div><div className="md:hidden">{lead.row}</div></>}
                <EmptyState icon={Search} title={t('noGroupsFound')} description={t('adjustFilters')} />
                {createFor && <div className="mx-auto max-w-xs"><CreateCard l1Slug={createFor} variant="card" /></div>}
            </>
        );
    }
    return (
        <>
            <GroupList lead={lead} groups={groups} activity={activity} faces={faces} createFor={createFor} filters={params} highlight={params.q} myRoles={myRoles} />
            {canAskMore && (
                <div className="mt-5 flex justify-center">
                    <Link href={discoveryHref(params, { limit: params.limit + DISCOVERY_GROUPS_PAGE })} scroll={false} className={buttonClass('quiet')}>
                        {t('showMore')}
                    </Link>
                </div>
            )}
        </>
    );
}
