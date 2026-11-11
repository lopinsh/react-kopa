import { Pencil, Plus, Sparkles } from 'lucide-react';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { signInUrl } from '@/lib/auth-redirect';
import { HUB_PREVIEW_ROWS } from '@/lib/constants';
import { hubPages } from '@/lib/hub-pages';
import { createGroupHref } from '@/lib/hub-path';
import { HubService, type HubContext } from '@/lib/services/hub.service';
import { HubCityService } from '@/lib/services/hub-city.service';
import { HubNoteService } from '@/lib/services/hub-note.service';
import { buttonClass } from '@/components/ui/Button';
import GroupRow from '@/components/discovery/GroupRow';
import ActivityFeed from '@/components/hubs/ActivityFeed';
import HubEventRows from '@/components/hubs/HubEventRows';
import OverviewTabs from '@/components/hubs/OverviewTabs';
import NoteRow from '@/components/hubs/notes/NoteRow';
import HubSection from '@/components/hubs/HubSection';
import SubTopicChips from '@/components/hubs/SubTopicChips';

const BOX = 'rounded-2xl bg-surface shadow-card frame';

/**
 * Pārskats of a hub (K1-19..25, K2-17..19): the tab row, then Aktivitāte, Ziņas and Pasākumi (K-89), Grupas as a full row and the sub-veidi chips.
 * Grid: one column; from `xl` Aktivitāte left over two rows, Ziņas and Pasākumi right (the 1200 px frame holds no third column at 1920 px). Everything is public, so signed out
 * sees the same page without names (K-24b, K-41).
 */
export default async function OverviewPage({ hub, cities, locale, viewerId, viewerRole }: { hub: HubContext; cities: string[]; locale: string; viewerId?: string; viewerRole?: string | null }) {
    const zone = await getTimeZone();
    const viewer = viewerId ? { id: viewerId, role: viewerRole } : undefined;
    const [t, periods, preview, groups, notes, noteCount, requestCount] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        HubService.getActivity(hub, { cities }, locale, zone),
        HubService.getEventPreview(hub, { cities, take: HUB_PREVIEW_ROWS }, locale, viewerId),
        HubService.getGroups(hub, { cities, tab: 'all', take: HUB_PREVIEW_ROWS }, locale, viewerId),
        HubNoteService.list(hub, { cities, q: '', tab: 'all', take: HUB_PREVIEW_ROWS }, locale, viewer),
        HubNoteService.count(hub, cities),
        hub.local ? HubCityService.requestCount(hub.local.hubCityId) : Promise.resolve(0),
    ]);
    const pages = hubPages(hub.href);
    const hrefOf = (key: 'groups' | 'events' | 'messages') => pages.find((p) => p.key === key)?.href ?? hub.href;
    const notesHref = hrefOf('messages');
    const composeHref = viewer ? `${notesHref}${notesHref.includes('?') ? '&' : '?'}compose=1` : null;
    const writeClass = buttonClass('secondary', undefined, 'sm');
    const write = composeHref
        ? <Link href={composeHref} className={writeClass}><Pencil aria-hidden className="size-3.5" />{t('notes.write')}</Link>
        : <a href={signInUrl(locale, `${hub.href}/messages?compose=1`)} className={writeClass}><Pencil aria-hidden className="size-3.5" />{t('notes.write')}</a>;

    return (
        <>
            <OverviewTabs items={[{ id: 'hub-activity', label: t('activity.title') }, { id: 'hub-notes', label: t('pages.messages') }, { id: 'hub-events', label: t('pages.events') }, { id: 'hub-groups', label: t('pages.groups') }]} />
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-section xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="min-w-0 xl:row-span-2 2xl:row-span-1">
                    <HubSection id="hub-activity" title={t('activity.title')}>
                        <div className={`${BOX} p-4`}>
                            {periods.length === 0 && requestCount > 0
                                ? <p className="flex items-center gap-2 text-body-sm text-foreground"><Sparkles aria-hidden className="size-4 shrink-0 text-foreground-muted" />{t('activity.openedAfter', { n: requestCount })}</p>
                                : <ActivityFeed periods={periods} locale={locale} />}
                        </div>
                    </HubSection>
                </div>
                <HubSection id="hub-notes" title={t('pages.messages')} count={noteCount} action={write} link={{ href: notesHref, label: t('notes.all') }}>
                    <div className={`${BOX} px-4`}>
                        {notes.rows.length === 0 ? <p className="py-4 text-body-sm text-foreground-muted">{t('notes.empty')}</p> : notes.rows.map((n) => <NoteRow key={n.id} note={n} />)}
                    </div>
                </HubSection>
                <HubSection id="hub-events" title={t('pages.events')} count={preview.total} link={{ href: hrefOf('events'), label: t('events.all') }}>
                    <div className={`${BOX} px-4`}><HubEventRows events={preview.events} locale={locale} /></div>
                </HubSection>
                <div className="xl:col-span-full">
                    <HubSection id="hub-groups" title={t('pages.groups')} count={groups.total} link={{ href: hrefOf('groups'), label: t('groups.all', { n: groups.total }) }}>
                        {groups.groups.length === 0 ? (
                            <div className={`${BOX} grid justify-items-start gap-3 p-4`}>
                                <p className="text-body-sm text-foreground-muted">{t('groups.empty')}</p>
                                <Link href={createGroupHref(hub.l1Slug, hub.slug, hub.local?.citySlug)} className={buttonClass('primary', undefined, 'sm')}><Plus aria-hidden className="size-4" />{t('actions.createGroup')}</Link>
                            </div>
                        ) : (
                            <div className={`${BOX} px-4`}>
                                {groups.groups.map((g) => <GroupRow key={g.id} group={g} activity={groups.activity[g.id]} fullPage={!!groups.myRoles[g.id]} role={groups.myRoles[g.id]} showMember />)}
                            </div>
                        )}
                    </HubSection>
                </div>
                {hub.subTopics.length > 0 && (
                    <div className="xl:col-span-full">
                        <HubSection id="hub-subtopics" title={t('subTopics.title')} count={hub.subTopics.length}><SubTopicChips hub={hub} locale={locale} /></HubSection>
                    </div>
                )}
            </div>
        </>
    );
}
