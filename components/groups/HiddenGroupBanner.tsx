'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { EyeOff } from 'lucide-react';
import { restoreGroup } from '@/actions/moderation-actions';
import { UI } from '@/lib/constants';

type Props = {
    groupId: string;
    reason: string | null;
    /** Only site admins may restore; the owner just sees why the group is hidden. */
    canRestore: boolean;
};

export default function HiddenGroupBanner({ groupId, reason, canRestore }: Props) {
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
        <div data-ui={UI.banner} className="flex flex-wrap items-center justify-between gap-3 bg-red-600 px-4 py-3 text-sm font-medium text-white">
            <span className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 shrink-0" />
                {t(canRestore ? 'hiddenBanner' : 'hiddenBannerOwner', { reason: reason ?? '' })}
            </span>
            {canRestore && (
                <button
                    onClick={handleRestore}
                    disabled={isPending}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-white/90 disabled:opacity-50"
                >
                    {t('restore')}
                </button>
            )}
        </div>
    );
}
