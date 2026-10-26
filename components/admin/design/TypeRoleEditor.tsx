'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { THEME_FONTS, TYPE_ROLES, type ThemeFontId, type ThemeStyleKey, type TypeRoleId } from '@/lib/constants';
import Stepper from './Stepper';
import { patchType, resolveTypeRoles } from '@/lib/theme/type-edit';
import { roleFontId } from '@/lib/theme/type-vars';
import type { ThemeType } from '@/lib/validations/theme';

type Props = { roleId: TypeRoleId; type: ThemeType | undefined; headingFont: ThemeFontId; bodyFont: ThemeFontId; styleKey: ThemeStyleKey; disabled: boolean; onType: (type: ThemeType | undefined) => void };
type Override = NonNullable<NonNullable<ThemeType['roles']>[TypeRoleId]>;

/** Edits one role: font, size (phone and desktop for fluid roles), weight, reset. Props carry no page state, so the R23 drawer can reuse it. */
export default function TypeRoleEditor({ roleId, type, headingFont, bodyFont, styleKey, disabled, onType }: Props) {
    const t = useTranslations('admin.design.type');
    const role = TYPE_ROLES.find((r) => r.id === roleId) ?? TYPE_ROLES[0];
    const res = resolveTypeRoles(type, headingFont, bodyFont, styleKey).find((r) => r.id === roleId) ?? resolveTypeRoles(type, headingFont, bodyFont, styleKey)[0];
    const fluid = 'fluid' in role.size;
    const faceId = roleFontId(res.font, headingFont, bodyFont);
    const labelOf = (id: ThemeFontId) => THEME_FONTS.find((f) => f.id === id)?.label ?? '';
    const face = THEME_FONTS.find((f) => f.id === faceId) ?? THEME_FONTS[0];
    const weights: readonly number[] = face.weights;
    const wi = Math.max(0, weights.indexOf(res.weight));
    const write = (o: Override | undefined) => {
        const roles = { ...type?.roles };
        if (o) roles[roleId] = o; else delete roles[roleId];
        onType(patchType(type, { roles: Object.keys(roles).length ? roles : undefined }, { headingFont, bodyFont, styleKey }));
    };
    const cur = type?.roles?.[roleId] ?? {};
    const clampPx = (n: number) => Math.min(120, Math.max(8, n));
    const sizeStep = (k: 'min' | 'max' | 'size', dir: -1 | 1) => {
        const v = clampPx(Math.round(k === 'max' ? res.maxPx : res.minPx) + dir);
        const next: Override = { ...cur, [k]: v };
        if (k === 'min' && v > res.maxPx) next.max = v;
        if (k === 'max' && v < res.minPx) next.min = v;
        write(next);
    };
    const row = (k: 'min' | 'max' | 'size', label: string) => {
        const v = Math.round(k === 'max' ? res.maxPx : res.minPx);
        return <Stepper key={k} label={label} value={t('px', { value: v })} display={t('px', { value: v })} canLess={v > 8} canMore={v < 120} disabled={disabled} onStep={(d) => sizeStep(k, d)} />;
    };
    const hideWeight = roleId === 'human-note' && weights.length < 2;

    return (
        <div className="space-y-1 border-t border-border py-3">
            <p className="text-meta text-foreground-muted">{t(`roleHints.${roleId}`)}</p>
            <div className="flex min-h-11 items-center justify-between gap-3">
                <label htmlFor={`type-font-${roleId}`} className="text-body text-foreground">{t('font')}</label>
                <Select id={`type-font-${roleId}`} className="w-auto max-w-[60%]" disabled={disabled} value={res.font} onChange={(e) => write({ ...cur, font: e.target.value as NonNullable<Override['font']> })}>
                    <option value="heading">{t('fontHeading', { font: labelOf(headingFont) })}</option>
                    <option value="body">{t('fontBody', { font: labelOf(bodyFont) })}</option>
                    {THEME_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </Select>
            </div>
            {fluid ? [row('min', `${t('size')} ${t('phone')}`), row('max', `${t('size')} ${t('desktop')}`)] : row('size', t('size'))}
            {!hideWeight && (
                <Stepper label={t('weight')} value={String(res.weight)} display={String(res.weight)} canLess={wi > 0} canMore={wi < weights.length - 1} disabled={disabled} onStep={(d) => write({ ...cur, weight: weights[wi + d] })} />
            )}
            <Button type="button" variant="quiet" size="sm" disabled={disabled || !type?.roles?.[roleId]} onClick={() => write(undefined)}>{t('resetRole')}</Button>
        </div>
    );
}
