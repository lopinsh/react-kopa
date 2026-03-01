import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import RequestCard from './RequestCard';

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: { name: string | null; image: string | null };
}

type Props = {
    groupId: string;
    pendingMembers: {
        id: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
        applicationMessages: Message[];
    }[];
    locale: string;
};

export default function MembershipPanel({ groupId, pendingMembers, locale }: Props) {
    const t = useTranslations('group');

    if (pendingMembers.length === 0) return null;

    return (
        <section className="relative overflow-hidden rounded-3xl p-1 mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 opacity-80" aria-live="polite">
                <User className="h-3.5 w-3.5 text-[var(--accent)]" />
                {t('pendingRequests', { count: pendingMembers.length })}
            </h3>
            <div className="space-y-4">
                {pendingMembers.map((membership) => (
                    <RequestCard
                        key={membership.id}
                        groupId={groupId}
                        membershipId={membership.id}
                        targetUser={membership.user}
                        messages={membership.applicationMessages}
                        locale={locale}
                    />
                ))}
            </div>
        </section>
    );
}
