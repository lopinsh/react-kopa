'use client';

import { useTranslations } from 'next-intl';
import { TYPE_EMPHASIS, TYPE_EMPHASIS_LIMITS, type TypeEmphasis } from '@/lib/constants';
import { emphasisStep, patchType } from '@/lib/theme/type-edit';
import type { ThemeType } from '@/lib/validations/theme';
import Stepper from './Stepper';

const LABEL: Record<TypeEmphasis, 'emphasisMedium' | 'emphasisStrong'> = { medium: 'emphasisMedium', strong: 'emphasisStrong' };

/** The two emphasis steps over the role weight (vidēji, izcelts): site-wide, medium never above strong. */
export default function EmphasisField({ type, disabled, onType }: { type: ThemeType | undefined; disabled: boolean; onType: (type: ThemeType | undefined) => void }) {
    const t = useTranslations('admin.design.type');
    const { min, max, step } = TYPE_EMPHASIS_LIMITS;
    const cur = { medium: emphasisStep(type, 'medium'), strong: emphasisStep(type, 'strong') };
    const set = (key: TypeEmphasis, dir: -1 | 1) => onType(patchType(type, { emphasis: { ...cur, [key]: cur[key] + dir * step } }));
    return (
        <div>
            {TYPE_EMPHASIS.map(({ key }) => {
                const lo = key === 'strong' ? cur.medium : min;
                const hi = key === 'medium' ? cur.strong : max;
                const value = t('emphasisStep', { value: cur[key] });
                return <Stepper key={key} label={t(LABEL[key])} value={value} display={value} canLess={cur[key] > lo} canMore={cur[key] < hi} disabled={disabled} onStep={(d) => set(key, d)} />;
            })}
            <p className="text-meta text-foreground-muted">{t('emphasisHint')}</p>
        </div>
    );
}
