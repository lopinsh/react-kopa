import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getConversations } from '@/actions/message-actions';
import MessagesLayout from '@/components/messages/MessagesLayout';

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/${locale}/auth/signin`);
    }

    const conversationsResponse = await getConversations();
    const conversations = conversationsResponse.success ? conversationsResponse.data : [];

    return (
        <MessagesLayout
            initialConversations={conversations}
            currentUserId={session.user.id}
            locale={locale}
        />
    );
}
