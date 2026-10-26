'use client';

import { useTranslations } from 'next-intl';
import { type TypeRoleId } from '@/lib/constants';
import { emphasisStep } from '@/lib/theme/type-edit';
import EmphasisField from '@/components/admin/design/EmphasisField';
import type { ThemeType } from '@/lib/validations/theme';
import type { TextExplanation } from './explainText';

/**
 * One line under the role name: role and weight, emphasis, pelēks, selected or pressed. The "+step" shows only when the role weight plus the step
 * is the result (buttons and tags start their emphasis below the role weight, so there only the result is shown).
 */
export default function TextExplain({ role, explained, type, onType }: { role: TypeRoleId; explained: TextExplanation; type: ThemeType | undefined; onType: (type: ThemeType | undefined) => void }) {
    const t = useTranslations('admin.panel.design');
    const tRoles = useTranslations('admin.design.type.roles');
    const { base, weight, emphasis, muted, state } = explained;
    const parts: string[] = [];
    parts.push(base === null ? tRoles(role) : t('explain.role', { role: tRoles(role), weight: base }));
    if (emphasis) {
        const step = emphasisStep(type, emphasis);
        const name = t(`variants.${emphasis}`);
        parts.push(base !== null && base + step === weight ? t('explain.emphasis', { name, step, weight }) : t('explain.emphasisResult', { name, weight }));
    }
    if (muted) parts.push(t('variants.muted'));
    if (state) parts.push(t(`states.${state}`));
    return (
        <>
            <p className="text-meta text-foreground-muted" aria-label={t('explain.label')}>{parts.join(' · ')}</p>
            {emphasis && <EmphasisField type={type} disabled={false} onType={onType} />}
        </>
    );
}
