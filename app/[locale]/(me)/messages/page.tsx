import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MessageService } from '@/lib/services/message.service';
import MessagesLayout from '@/components/messages/MessagesLayout';
import { signInUrl } from '@/lib/auth-redirect';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'messages' });
    return { title: t('title') };
}

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

    const conversations = await MessageService.listInbox(session.user.id, locale);

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
