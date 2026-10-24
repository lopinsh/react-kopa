'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import { TYPE_ROLES, type ThemeFontId, type TypeRoleId } from '@/lib/constants';
import { resolveTypeRoles } from '@/lib/theme/type-edit';
import { roleFontId } from '@/lib/theme/type-vars';
import type { ThemeType } from '@/lib/validations/theme';
import TypeRoleEditor from './TypeRoleEditor';

type Props = { theme: DraftTheme; disabled: boolean; onType: (type: ThemeType | undefined) => void };

// The draft's fonts (not the published root ones), so a font change in Fonti shows in the names too. Static strings so Tailwind sees them.
const FACE: Record<ThemeFontId, string> = {
    geist: '[font-family:var(--font-geist-sans)]', literata: '[font-family:var(--font-literata)]', commissioner: '[font-family:var(--font-commissioner)]',
    atkinson: '[font-family:var(--font-atkinson)]', 'alegreya-sans': '[font-family:var(--font-alegreya-sans)]', 'source-serif': '[font-family:var(--font-source-serif)]',
    lora: '[font-family:var(--font-lora)]', 'nunito-sans': '[font-family:var(--font-nunito-sans)]', raleway: '[font-family:var(--font-raleway)]',
    'archivo-black': '[font-family:var(--font-archivo-black)]',
};

const WEIGHT: Record<number, string> = { 100: '[font-weight:100]', 200: '[font-weight:200]', 300: '[font-weight:300]', 400: '[font-weight:400]', 500: '[font-weight:500]', 600: '[font-weight:600]', 700: '[font-weight:700]', 800: '[font-weight:800]', 900: '[font-weight:900]', 1000: '[font-weight:1000]' };

/** Lomas: the 11 roles as a list, each showing what it resolves to; one opens at a time into its editor. */
export default function TypeRolesPart({ theme, disabled, onType }: Props) {
    const t = useTranslations('admin.design.type');
    const [open, setOpen] = useState<TypeRoleId | null>(null);
    const roles = resolveTypeRoles(theme.type, theme.headingFont, theme.bodyFont, theme.styleKey);
    return (
        <div>
            <h3 className="mb-2 text-body text-foreground">{t('rolesTitle')}</h3>
            <ul className="rounded-2xl bg-surface px-4 py-0.5 shadow-card frame">
                {TYPE_ROLES.map((r) => {
                    const res = roles.find((x) => x.id === r.id);
                    if (!res) return null;
                    const isOpen = open === r.id;
                    const px = res.minPx === res.maxPx ? String(res.minPx) : `${res.minPx}→${res.maxPx}`;
                    return (
                        <li key={r.id} className="border-t border-border first:border-t-0">
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setOpen(isOpen ? null : r.id)}
                                className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left"
                            >
                                <span className={clsx('flex min-w-0 items-center gap-2 text-body text-foreground', FACE[roleFontId(res.font, theme.headingFont, theme.bodyFont)], WEIGHT[res.weight])}>
                                    <span className="truncate">{t(`roles.${r.id}`)}</span>
                                    {res.overridden && <><span className="size-2 shrink-0 rounded-pill bg-primary" aria-hidden="true" /><span className="sr-only">{t('overridden')}</span></>}
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-meta tabular-nums text-foreground-muted">
                                    {px} · {res.weight}
                                    <ChevronDown className={clsx('size-4', isOpen && 'rotate-180')} aria-hidden="true" />
                                </span>
                            </button>
                            {isOpen && (
                                <TypeRoleEditor roleId={r.id} type={theme.type} headingFont={theme.headingFont} bodyFont={theme.bodyFont} styleKey={theme.styleKey} disabled={disabled} onType={onType} />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
