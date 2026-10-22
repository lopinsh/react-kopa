'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { chosenCount } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';
import { CHIP } from './chip-styles';

/** "Notīrīt visu": a chip with moss text. Clears the word, the place, the Tēma, the Veidi and the date; keeps the switch side. Only from two chosen things. */
export default function ClearAll({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const { params, go } = useDiscoveryNav();
    if (chosenCount(params) < 2) return null;
    return (
        <button
            type="button"
            data-ui={UI.clearAll}
            onClick={() => go({ q: '', cities: [], category: null, tags: [], date: { kind: 'week' }, day: null })}
            className={clsx(CHIP, 'shrink-0 bg-surface text-primary weight-strong hover:bg-tint', className)}
        >
            {t('clearAll')}
        </button>
    );
}
