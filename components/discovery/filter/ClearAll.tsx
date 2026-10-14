'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { chosenCount } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';

/** "Notīrīt visu": clears the word, the place, the Tēma, the Veidi and the date; keeps the switch side. Only from two chosen things. */
export default function ClearAll({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const { params, go } = useDiscoveryNav();
    if (chosenCount(params) < 2) return null;
    return (
        <button
            type="button"
            data-ui={UI.clearAll}
            onClick={() => go({ q: '', cities: [], category: null, tags: [], date: { kind: 'week' }, day: null })}
            className={clsx('shrink-0 whitespace-nowrap px-1 py-2 text-xs font-semibold text-primary underline underline-offset-2 hover:opacity-80', className)}
        >
            {t('clearAll')}
        </button>
    );
}
