'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { floorRatio } from '@/lib/theme/contrast';

type Props = { light: number; dark: number; lightOk: boolean; darkOk: boolean };

const PILL = 'whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold';

/** "AA ✓" when both tones pass; otherwise the first failing tone with its ratio, in the warning colour. */
export default function ContrastPill({ light, dark, lightOk, darkOk }: Props) {
    const t = useTranslations('admin.design.tones');
    const format = useFormatter();
    const num = (n: number) => format.number(floorRatio(n), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const ratios = t('ratios', { light: num(light), dark: num(dark) });
    const ok = lightOk && darkOk;
    const failing = lightOk ? { word: t('swatchDark'), ratio: dark } : { word: t('swatchLight'), ratio: light };

    return (
        <span title={ratios} className={`${PILL} ${ok ? 'bg-tint text-primary' : 'bg-warning/10 text-warning'}`}>
            {ok ? t('ok') : t('low', { mode: failing.word, ratio: num(failing.ratio) })}
            <span className="sr-only">{ratios}</span>
        </span>
    );
}
