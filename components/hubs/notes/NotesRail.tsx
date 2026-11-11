import { getTranslations } from 'next-intl/server';
import { HUB_PREVIEW_ROWS } from '@/lib/constants';
import { HubService, type HubContext } from '@/lib/services/hub.service';
import GroupRow from '@/components/discovery/GroupRow';
import HubEventRows from '@/components/hubs/HubEventRows';
import HubSection from '@/components/hubs/HubSection';
import SubTopicChips from '@/components/hubs/SubTopicChips';

/** The Ziņas page's side column from `xl` (K2-16, Variant B): the next events, groups, sub-veidi and the member line, built from the Pārskats parts. */
export default async function NotesRail({ hub, cities, locale, viewerId }: { hub: HubContext; cities: string[]; locale: string; viewerId?: string }) {
    const [t, events, groups] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        HubService.getEventPreview(hub, { cities, take: HUB_PREVIEW_ROWS }, locale, viewerId),
        HubService.getGroups(hub, { cities, tab: 'all', take: HUB_PREVIEW_ROWS }, locale, viewerId),
    ]);
    return (
        <aside aria-label={t('frame.pagesLabel')} className="hidden content-start gap-section xl:sticky xl:top-5 xl:grid xl:self-start">
            <HubSection id="rail-events" title={t('rail.events')}>
                <div className="rounded-2xl bg-surface px-4 shadow-card frame"><HubEventRows events={events.events} locale={locale} /></div>
            </HubSection>
            <HubSection id="rail-groups" title={t('pages.groups')}>
                <div className="rounded-2xl bg-surface px-4 shadow-card frame">
                    {groups.groups.map((g) => <GroupRow key={g.id} group={g} activity={groups.activity[g.id]} fullPage={!!groups.myRoles[g.id]} role={groups.myRoles[g.id]} showMember />)}
                </div>
            </HubSection>
            {hub.subTopics.length > 0 && <HubSection id="rail-subtopics" title={t('subTopics.title')}><SubTopicChips hub={hub} locale={locale} /></HubSection>}
            <HubSection id="rail-about" title={t('rail.about')}>
                <p className="text-body-sm text-foreground-muted">{t('memberLine', { members: hub.stats.memberCount, groups: hub.stats.groupCount })}</p>
            </HubSection>
        </aside>
    );
}
