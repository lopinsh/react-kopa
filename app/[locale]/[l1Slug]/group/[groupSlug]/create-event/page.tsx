import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import EventCreationWizard from '@/components/forms/EventCreationWizard';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

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

    const t = await getTranslations('event');

    return (
        <div className="min-h-full bg-surface-elevated/30 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-6 w-full max-w-lg">
                    <Link
                        href={`/${l1Slug}/group/${groupSlug}/events`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('allEvents')}
                    </Link>
                </div>
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                    <p className="mt-2 text-foreground-muted">{t('createSubtitle')}</p>
                </div>

                <EventCreationWizard
                    groupId={group.id}
                    groupSlug={groupSlug}
                    l1Slug={l1Slug}
                />
            </div>
        </div>
    );
}
