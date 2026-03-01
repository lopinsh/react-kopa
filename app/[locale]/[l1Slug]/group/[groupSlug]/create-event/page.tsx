import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import EventCreationWizard from '@/components/forms/EventCreationWizard';
import { auth } from '@/lib/auth';

export default async function CreateEventPage({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();

    if (!session) {
        redirect(`/${locale}/api/auth/signin`);
    }

    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Only Owner/Admin can create events (Logic also enforced in action)
    const canCreate = group.userRole === 'OWNER' || group.userRole === 'ADMIN';

    if (!canCreate) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    return (
        <div className="min-h-full bg-surface-elevated/30 py-20">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                    <p className="mt-2 text-foreground-muted">Create a new event for your community</p>
                </div>

                <EventCreationWizard
                    groupId={group.id}
                    groupSlug={groupSlug}
                    l1Slug={l1Slug}
                    accentColor={group.accentColor}
                />
            </div>
        </div>
    );
}
