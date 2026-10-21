import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { EventService, type NextEventView } from '@/lib/services/event.service';
import NextMeetingRow from './NextMeetingRow';

type ViewProps = { event: Pick<NextEventView, 'slug' | 'title' | 'titleLang' | 'startDate' | 'endDate' | 'running' | 'excerpt'>; title: string; allLabel: string; groupHref: string };

/** The box itself, without data: "Nākamais pasākums", "Visi →" and one row (also used by the UI-elements page). */
export function NextMeetingView({ event, title, allLabel, groupHref }: ViewProps) {
    return (
        <section data-ui={UI.nextMeeting} className="max-w-page rounded-2xl bg-surface px-4 pb-1 pt-3 shadow-card frame">
            <div className="flex items-baseline justify-between">
                <h2 className="font-sans text-section text-foreground">{title}</h2>
                <Link href={`${groupHref}/events`} className="inline-flex items-center gap-1 text-meta text-primary">
                    {allLabel}
                    <ArrowRight aria-hidden className="size-3.5" />
                </Link>
            </div>
            <NextMeetingRow event={event} href={`${groupHref}/events/${event.slug}`} />
        </section>
    );
}

/** The group's next event the viewer may see (members-only ones only for members); nothing at all when there is none. */
export default async function NextMeetingBox({ groupId, groupHref, viewerId }: { groupId: string; groupHref: string; viewerId?: string }) {
    const locale = await getLocale();
    const event = await EventService.getNextVisibleEvent(groupId, locale, viewerId);
    if (!event) return null;
    const t = await getTranslations('group.nextMeeting');
    return <NextMeetingView event={event} title={t('title')} allLabel={t('all')} groupHref={groupHref} />;
}
