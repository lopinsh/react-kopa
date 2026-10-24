'use client';

import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { TYPE_ROLES } from '@/lib/constants';
import type { ResolvedRole } from '@/lib/theme/type-edit';

/** The role ladder of the Burti part: one line per role in its own utility, labelled with what it resolves to. Lives inside ThemeSample's scoped variables. */
export default function TypeSample({ roles }: { roles: ResolvedRole[] }) {
    const t = useTranslations('admin.design.type');
    const tSample = useTranslations('admin.design.sample');
    return (
        <div className="rounded-2xl bg-surface p-4 shadow-card frame sm:p-5">
            <ul className="space-y-4">
                {TYPE_ROLES.map((r) => {
                    const res = roles.find((x) => x.id === r.id);
                    return (
                        <li key={r.id}>
                            <p className="text-meta text-foreground-muted">
                                {t(`roles.${r.id}`)} · {t('roleSummary', { min: res?.minPx ?? 0, max: res?.maxPx ?? 0, weight: res?.weight ?? 0 })}
                            </p>
                            {r.id === 'tag' ? <Badge>{tSample('badge')}</Badge> : <p className={r.utility}>{r.heading ? t('sampleHeading') : t('sampleLine')}</p>}
                        </li>
                    );
                })}
            </ul>
            <p className="mt-4 text-body tabular-nums">{t('sampleNumbers')}</p>
        </div>
    );
}
