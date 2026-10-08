'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { EyeOff } from 'lucide-react';
import { restoreGroup } from '@/actions/moderation-actions';

type Props = {
    groupId: string;
    reason: string | null;
};

export default function HiddenGroupBanner({ groupId, reason }: Props) {
    const t = useTranslations('moderation');
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRestore = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await restoreGroup(groupId, locale);
            if (res.success) router.refresh();
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-red-600 px-4 py-3 text-sm font-medium text-white">
            <span className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 shrink-0" />
                {t('hiddenBanner', { reason: reason ?? '' })}
            </span>
            <button
                onClick={handleRestore}
                disabled={isPending}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-white/90 disabled:opacity-50"
            >
                {t('restore')}
            </button>
        </div>
    );
}
