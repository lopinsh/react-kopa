import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import EventForm from '@/components/forms/event/EventForm';
import { CitiesProvider } from '@/components/providers/CitiesContext';
import { CityService } from '@/lib/services/city.service';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { getTranslations } from 'next-intl/server';

export default async function CreateEventPage({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();

    if (!session) {
        redirect(signInUrl(locale, `/${l1Slug}/group/${groupSlug}/create-event`));
    }

    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Only Owner/Admin can create events (Logic also enforced in action)
    const canCreate = group.user.isAdmin;

    if (!canCreate) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    const [t, tw, cities] = await Promise.all([getTranslations('event'), getTranslations('eventWizard'), CityService.listActive(locale)]);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-title">{tw('createTitle')}</h1>
                <p className="mt-2 text-foreground-muted">{t('createSubtitle')}</p>
            </div>

            <CitiesProvider cities={cities}>
                <EventForm groupId={group.id} groupSlug={groupSlug} l1Slug={l1Slug} />
            </CitiesProvider>
        </>
    );
}
