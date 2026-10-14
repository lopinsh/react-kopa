import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import GroupList from './GroupList';
import CreateCard from './CreateCard';
import EmptyState from '@/components/ui/EmptyState';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import { DISCOVERY_GROUPS_MAX, DISCOVERY_GROUPS_PAGE } from '@/lib/constants';
import type { GroupCardData } from '@/lib/services/group-card';

type Props = {
    groups: GroupCardData[];
    hasMore: boolean;
    nextMeetings: Record<string, Date>;
    params: DiscoveryParams;
};

/** The Grupas list: the cards or rows, "Rādīt vēl" when more are left, the create card at the true end of a chosen category (also when it is empty). */
export default async function GroupResults({ groups, hasMore, nextMeetings, params }: Props) {
    const t = await getTranslations('discovery');
    const createFor = params.category && !hasMore ? params.category : null;
    const canAskMore = hasMore && params.limit < DISCOVERY_GROUPS_MAX;

    if (groups.length === 0) {
        return (
            <>
                <EmptyState icon={Search} title={t('noGroupsFound')} description={t('adjustFilters')} />
                {createFor && <div className="mx-auto max-w-xs"><CreateCard l1Slug={createFor} variant="card" /></div>}
            </>
        );
    }
    return (
        <>
            <GroupList groups={groups} nextMeetings={nextMeetings} createFor={createFor} />
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
