import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import CategoryLine from '@/components/ui/CategoryLine';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import JoinStep from '@/components/events/JoinStep';
import FacesLine from '@/components/events/FacesLine';
import ShareEventButton from '@/components/events/ShareEventButton';
import { UI } from '@/lib/constants';
import { langAttr } from '@/lib/translations';
import type { EventPageData } from '@/lib/services/event-page';
import EventPicture from './EventPicture';
import EventFacts from './EventFacts';
import EventTextSection from './EventTextSection';

/**
 * The event page (AR-59): the panel's content in full, as one surface inside the group's frame. Own picture only, title, category line,
 * the status words, when and where, "Par pasākumu" and "Praktiskā informācija" as identical sections, who is going, the step and "Dalīties",
 * and the team's "Rīkotājiem" box (`organiser`) at the bottom.
 */
export default async function EventArticle({ event, organiser }: { event: EventPageData; organiser?: ReactNode }) {
    const locale = await getLocale();
    const t = await getTranslations('event');
    const isRequest = event.joinMode === 'REQUEST';
    const past = event.timing === 'past';
    const titleLabel = langAttr(event.titleLang, locale);
    // The status line (AR-56): the same quiet words as the row, only those that apply.
    const status = [isRequest && t('state.request'), isRequest && event.isFull && t('full'), event.membersOnly && t('membersOnly')].filter(Boolean).join(' · ');
    const showGoing = !past && event.going.count > 0;
    const showMax = !past && event.maxParticipants !== null;
    // Practical info: open events show it to everyone; request events only to approved people and organisers.
    const practicalLock = isRequest
        ? event.instructionsLocked ? { kind: 'locked' as const, text: t('instructionsLocked') } : { kind: 'members' as const, text: t('practicalInfoMembers') }
        : undefined;

    return (
        <article data-ui={UI.eventPage} style={{ ['--c' as string]: event.category.color }} className="grid max-w-[760px] gap-2.5 rounded-2xl bg-surface p-[18px] [overflow-wrap:anywhere] md:p-6 shadow-card frame">
            <EventPicture image={event.image} />
            <h1 lang={titleLabel} className="font-heading text-[22px] font-semibold leading-snug text-foreground md:text-[28px]">{event.title}</h1>
            {titleLabel && <FallbackLangLabel lang={titleLabel} className="justify-self-start" />}
            <CategoryLine color={event.category.color} category={event.category.l1Title} subCategories={event.subCategories} />
            {status && <p className="text-[13px] text-foreground-muted">{status}</p>}
            <EventFacts event={event} />
            {event.description && (
                <div className="mt-3.5">
                    <EventTextSection heading={t('aboutEvent')} html={event.description} lang={event.descriptionLang} titleLang={event.titleLang} />
                </div>
            )}
            {(event.instructions || event.instructionsLocked) && (
                <div className="mt-3.5">
                    <EventTextSection
                        heading={t('practicalInfo')}
                        html={event.instructions}
                        lang={event.instructionsLang}
                        titleLang={event.titleLang}
                        lock={practicalLock}
                    />
                </div>
            )}
            {past && event.going.count > 0 && <p className="text-sm text-foreground-muted">{t('wentCount', { count: event.going.count })}</p>}
            {(showGoing || showMax) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground-muted">
                    <FacesLine going={event.going} ended={false} />
                    {showGoing && showMax && <span aria-hidden="true">·</span>}
                    {showMax && <span>{t('aboutPeople', { count: event.maxParticipants ?? 0 })}</span>}
                </div>
            )}
            <JoinStep join={event.join} trailing={<ShareEventButton title={event.title} />} />
            {organiser}
        </article>
    );
}
