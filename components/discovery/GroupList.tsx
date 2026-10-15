import GroupCard from './GroupCard';
import GroupRow from './GroupRow';
import CreateCard from './CreateCard';
import type { GroupCardData } from '@/lib/services/group-card';
import type { DiscoveryParams } from '@/lib/discovery-params';

type Props = {
    groups: GroupCardData[];
    /** Group id → start of its next visible meeting. */
    nextMeetings?: Record<string, Date>;
    /** Adds the create card at the end, for this main category. */
    createFor?: string | null;
    /** On discovery: the list's filters, which the cards' category links add to. */
    filters?: DiscoveryParams;
    /** The search word, marked in the names. */
    highlight?: string;
};

/**
 * Groups as cards from `md` (a grid that fills the width) and as rows on phones. Both are server-rendered; the one not in use is
 * `display: none`. Used by discovery and the profiles.
 */
export default function GroupList({ groups, nextMeetings = {}, createFor, filters, highlight }: Props) {
    return (
        <>
            <div className="hidden gap-3 md:grid md:auto-rows-fr md:grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
                {groups.map((g) => <GroupCard key={g.id} group={g} nextMeeting={nextMeetings[g.id]} filters={filters} highlight={highlight} />)}
                {createFor && <CreateCard l1Slug={createFor} variant="card" />}
            </div>
            <div className="rounded-2xl bg-surface px-3.5 md:hidden">
                {groups.map((g) => <GroupRow key={g.id} group={g} highlight={highlight} />)}
                {createFor && <CreateCard l1Slug={createFor} variant="row" />}
            </div>
        </>
    );
}
