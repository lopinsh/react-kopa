import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import EventCreationWizard from '@/components/forms/EventCreationWizard';
import { auth } from '@/lib/auth';
import DialogModal from '@/components/ui/DialogModal';

export default async function CreateEventModal({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, groupSlug, l1Slug } = await params as any;

    // Auth Check
    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/${locale}/api/auth/signin`);
    }

    // Role Check
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session.user.id);
    if (!group) notFound();

    if (group.userRole !== 'OWNER' && group.userRole !== 'ADMIN') {
        notFound();
    }

    return (
        <DialogModal>
            <EventCreationWizard groupId={group.id} groupSlug={group.slug} l1Slug={l1Slug} accentColor={group.accentColor} />
        </DialogModal>
    );
}
