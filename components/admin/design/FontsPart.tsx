'use client';

import { useTranslations } from 'next-intl';
import { THEME_FONTS, type ThemeFontId } from '@/lib/constants';
import type { DraftTheme } from '@/hooks/use-theme-draft';

type Role = 'headingFont' | 'bodyFont';
type Props = { theme: DraftTheme; disabled: boolean; onFont: (which: Role, id: ThemeFontId) => void };

const ROLES: Role[] = ['headingFont', 'bodyFont'];

/** Fonti: one radio list per role; every font is shown in itself with a Latvian sample. */
export default function FontsPart({ theme, disabled, onFont }: Props) {
    const t = useTranslations('admin.design');
    return (
        <section aria-labelledby="design-fonts" className="space-y-6">
            <div>
                <h2 id="design-fonts" className="text-section text-foreground">{t('parts.fonts')}</h2>
                <p className="mt-1 text-body-sm text-foreground-muted">{t('fonts.lead')}</p>
            </div>
            {ROLES.map((role) => (
                <fieldset key={role}>
                    <legend className="mb-2 text-body text-foreground">{t(role)}</legend>
                    <div className="rounded-2xl bg-surface px-4 py-0.5 shadow-card frame">
                        {THEME_FONTS.map((f) => (
                            <label key={f.id} className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-border py-2.5 first:border-t-0">
                                <input
                                    type="radio"
                                    name={role}
                                    className="h-4 w-4 shrink-0 accent-primary"
                                    checked={theme[role] === f.id}
                                    disabled={disabled}
                                    onChange={() => onFont(role, f.id)}
                                />
                                <span style={{ '--f': `var(${f.cssVar})` } as React.CSSProperties} className="min-w-0">
                                    <span className="block text-body-sm text-foreground [font-family:var(--f)]">{f.label}</span>
                                    <span className="block text-meta text-foreground-muted [font-family:var(--f)]">{t('sample.latvian')}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            ))}
        </section>
    );
}
