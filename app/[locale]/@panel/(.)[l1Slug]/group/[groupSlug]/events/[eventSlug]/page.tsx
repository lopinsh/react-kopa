import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EventService } from '@/lib/services/event.service';
import { wantsFullPage } from '@/lib/panel-routes';
import EventPanel from '@/components/panels/EventPanel';
import EventGatePanel from '@/components/panels/EventGatePanel';
import PanelGone from '@/components/panels/PanelGone';
import FullPageInstead from '@/components/panels/FullPageInstead';

type Props = { params: Promise<{ locale: string; l1Slug: string; groupSlug: string; eventSlug: string }> };

/** The event panel (AR-55) over the page you are on. One service call decides what this viewer may see: the event, the members-only sentence, or nothing. */
export default async function EventPanelPage({ params }: Props) {
    const { locale, l1Slug, groupSlug, eventSlug } = await params;
    if (wantsFullPage((await headers()).get('next-url'), { locale, l1Slug, groupSlug, eventSlug })) return <FullPageInstead />;
    const session = await auth();
    const result = await EventService.getEventPanel(eventSlug, groupSlug, l1Slug, locale, session?.user?.id);
    if (!result) return <PanelGone kind="event" />;
    return result.kind === 'event' ? <EventPanel event={result.event} l1Slug={l1Slug} /> : <EventGatePanel group={result.group} />;
}
