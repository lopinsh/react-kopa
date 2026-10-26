import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import TextLink from '@/components/ui/TextLink';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { EventService } from '@/lib/services/event.service';
import { toBannerCredit } from '@/lib/banner';
import { isEventPast } from '@/lib/event-dates';
import { toTextLang } from '@/lib/translations';
import EventForm from '@/components/forms/event/EventForm';
import { CitiesProvider } from '@/components/providers/CitiesContext';
import { CityService } from '@/lib/services/city.service';

type Params = { locale: string; l1Slug: string; groupSlug: string; eventSlug: string };

export const metadata: Metadata = { robots: { index: false } };

export default async function EditEventPage({ params }: { params: Promise<Params> }) {
    const { locale, l1Slug, groupSlug, eventSlug } = await params;
    const session = await auth();
    const eventPath = `/${l1Slug}/group/${groupSlug}/events/${eventSlug}`;

    if (!session?.user?.id) redirect(signInUrl(locale, `${eventPath}/edit`));

    const event = await EventService.getEventWithContext(eventSlug, groupSlug, locale, session.user.id, l1Slug);
    if (!event) notFound();
    // Only organisers edit; everyone else goes back to the event itself.
    if (!event.viewer.canManage) redirect(`/${locale}${eventPath}`);
    // A finished event can't be edited (organisers can still delete it).
    if (isEventPast(event)) redirect(`/${locale}${eventPath}`);

    const [t, cities] = await Promise.all([getTranslations('event'), CityService.listActive(locale)]);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-title">{t('editTitle')}</h1>
                <p className="mt-2"><TextLink href={eventPath}>{event.title}</TextLink></p>
                <p className="mt-1 text-foreground">{t('editSubtitle')}</p>
            </div>

            <CitiesProvider cities={cities}>
                <EventForm
                    groupId={event.groupId}
                    groupSlug={groupSlug}
                    l1Slug={l1Slug}
                    waitingCount={event.viewer.pendingCount + event.viewer.waitlistCount}
                    event={{
                        id: event.id,
                        // The edit form works on the text of every language.
                        originalLang: event.editable?.originalLang ?? toTextLang(locale),
                        texts: event.editable?.texts ?? null,
                        location: event.location,
                        city: event.city,
                        isOnline: event.isOnline,
                        startDate: event.startDate.toISOString(),
                        endDate: event.endDate ? event.endDate.toISOString() : null,
                        maxParticipants: event.maxParticipants,
                        visibility: event.visibility,
                        joinMode: event.joinMode,
                        bannerImage: event.bannerImage,
                        bannerCredit: toBannerCredit(event.bannerCreditName, event.bannerCreditUser),
                    }}
                />
            </CitiesProvider>
        </>
    );
}
