'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { getOrCreateDirectChat } from '@/actions/message-actions';

/** Opens (or starts) the direct chat with a person. Only rendered when the server says the viewer may message them. */
export default function MessageUserButton({ userId }: { userId: string }) {
    const t = useTranslations('profile');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isOpening, setIsOpening] = useState(false);

    const handleClick = () => {
        if (isPending || isOpening) return;
        setError(null);
        startTransition(async () => {
            const result = await getOrCreateDirectChat(userId);
            if (result.success && result.data) {
                setIsOpening(true);
                router.push(`/messages?c=${result.data.conversationId}`);
            } else if (!result.success) {
                setError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <div className="w-full md:w-auto">
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending || isOpening}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:w-auto"
            >
                {isPending
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    : <MessageSquare className="h-4 w-4" />}
                {t('message')}
            </button>
            {error && <p role="alert" className="mt-2 text-xs font-bold text-red-500">{error}</p>}
        </div>
    );
}
