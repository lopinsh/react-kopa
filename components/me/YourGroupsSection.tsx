import GroupList from '@/components/discovery/GroupList';
import type { MyGroup, MyGroupsOverview } from '@/lib/types/own-area';

/** Tavas grupas (AR-61): the discovery cards and rows with your role and, for the team, the waiting requests. Every link is the full page. */
export default function YourGroupsSection({ groups, activity }: { groups: MyGroup[]; activity: MyGroupsOverview['activity'] }) {
    const mine = Object.fromEntries(groups.map((g) => [g.card.id, { role: g.role, requestCount: g.requestCount }]));
    return <GroupList groups={groups.map((g) => g.card)} activity={activity} mine={mine} fullPage />;
}
