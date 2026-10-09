import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getConversations } from '@/actions/message-actions';
import MessagesLayout from '@/components/messages/MessagesLayout';
import { signInUrl } from '@/lib/auth-redirect';

export default async function MessagesPage({ params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ c?: string | string[] }>;
}) {
    const { locale } = await params;
    const { c: rawC } = await searchParams;
    const c = typeof rawC === 'string' && rawC ? rawC : null;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(signInUrl(locale, c ? `/messages?c=${encodeURIComponent(c)}` : '/messages'));
    }

    const conversationsResponse = await getConversations();
    const conversations = conversationsResponse.success ? conversationsResponse.data : [];

    return (
        <MessagesLayout
            // Remount when a notification link opens another conversation while /messages is already open.
            key={c ?? ''}
            initialConversations={conversations}
            currentUserId={session.user.id}
            locale={locale}
            initialConversationId={c}
        />
    );
}
