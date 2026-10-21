import GroupCard from './GroupCard';
import GroupRow from './GroupRow';
import CreateCard from './CreateCard';
import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { DiscoveryParams } from '@/lib/discovery-params';
import type { MyRole } from '@/lib/types/own-area';

type Props = {
    groups: GroupCardData[];
    /** Group id → its latest activity (next meeting, else newest public announcement), shown on the card's bottom line (C2). */
    activity?: Record<string, CardActivity>;
    /** Adds the create card at the end, for this main category. */
    createFor?: string | null;
    /** On discovery: the list's filters, which the cards' category links add to. */
    filters?: DiscoveryParams;
    /** The search word, marked in the names. */
    highlight?: string;
    /** Every group links straight to its full page (Manas grupas: all of them are yours). */
    fullPage?: boolean;
    /** Ids of groups the viewer belongs to or waits for: those link straight to the full page (cmv9amjft). */
    fullPageIds?: string[];
    /** Manas grupas: group id → your role there and the requests waiting for the team (AR-09, OD-21). */
    mine?: Record<string, { role: MyRole; requestCount: number }>;
};

/**
 * Groups as cards from `md` (a grid that fills the width) and as rows on phones. Both are server-rendered; the one not in use is
 * `display: none`. Used by discovery and the profiles.
 */
export default function GroupList({ groups, activity = {}, createFor, filters, highlight, fullPage = false, fullPageIds, mine }: Props) {
    const full = (id: string) => fullPage || !!fullPageIds?.includes(id);
    return (
        <>
            <div className="hidden gap-[calc(var(--card-gap)+var(--shadow-room))] md:grid md:auto-rows-fr md:grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
                {groups.map((g) => <GroupCard key={g.id} group={g} activity={activity[g.id]} filters={filters} highlight={highlight} fullPage={full(g.id)} role={mine?.[g.id]?.role} requestCount={mine?.[g.id]?.requestCount} />)}
                {createFor && <CreateCard l1Slug={createFor} variant="card" />}
            </div>
            <div className="rounded-2xl bg-surface px-4 md:hidden shadow-card frame">
                {groups.map((g) => <GroupRow key={g.id} group={g} highlight={highlight} fullPage={full(g.id)} role={mine?.[g.id]?.role} requestCount={mine?.[g.id]?.requestCount} />)}
                {createFor && <CreateCard l1Slug={createFor} variant="row" />}
            </div>
        </>
    );
}
