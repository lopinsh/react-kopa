'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import Button from '@/components/ui/Button';

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
            <Button
                type="button"
                onClick={handleClick}
                disabled={isPending || isOpening}
                className="w-full md:w-auto"
            >
                {isPending
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    : <MessageSquare className="size-4" />}
                {t('message')}
            </Button>
            {error && <p role="alert" className="mt-2 text-tag text-danger">{error}</p>}
        </div>
    );
}
