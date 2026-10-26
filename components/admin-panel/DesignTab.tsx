'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { buttonClass } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import TypeRoleEditor from '@/components/admin/design/TypeRoleEditor';
import { useDraftActions } from '@/components/admin/design/useDraftActions';
import { TYPE_ROLES, type TypeRoleId } from '@/lib/constants';
import { resolveTypeRoles } from '@/lib/theme/type-edit';
import type { ThemeInput } from '@/lib/validations/theme';
import type { PanelTabProps } from './PanelTabBody';
import RoleChip from './RoleChip';
import { useDraftSave } from './useDraftSave';
import TextExplain from './TextExplain';
import { explainText, type TextExplanation } from './explainText';
import { useRolePicker } from './useRolePicker';

const isRoleId = (v: string | null): v is TypeRoleId => TYPE_ROLES.some((r) => r.id === v);

/** Dizains: click a text on the page (or choose a role) and edit that type role in the draft theme. */
export default function DesignTab({ paused, selection, onSelect, onPicked, designTheme, draftActive }: PanelTabProps & { designTheme: ThemeInput; draftActive: boolean }) {
    const t = useTranslations('admin.panel.design');
    const tRoles = useTranslations('admin.design.type.roles');
    const pathname = usePathname();
    const { theme, busy, saves, resetSaves, editType } = useDraftSave(designTheme);
    const { isPending, publish, discard } = useDraftActions();
    const [picked, setPicked] = useState<{ target: Element; el: Element; utility: string } | null>(null);
    const [explained, setExplained] = useState<TextExplanation | null>(null);
    const [count, setCount] = useState(0);
    const [warn, setWarn] = useState(false);
    const role = isRoleId(selection) ? selection : null;

    useRolePicker(!paused, ({ role: r, el, utility, target }) => {
        onSelect(r);
        setPicked({ target, el, utility });
        onPicked(el);
    });

    // The picked role's texts get a dashed outline (globals.css); counted again after each page move.
    useEffect(() => {
        const html = document.documentElement;
        if (role) html.dataset.adminRole = role; else delete html.dataset.adminRole;
        return () => { delete html.dataset.adminRole; };
    }, [role]);
    useEffect(() => {
        const utility = TYPE_ROLES.find((r) => r.id === role)?.utility;
        const id = window.setTimeout(() => setCount(utility ? document.querySelectorAll(`#content .${utility}`).length : 0), 150);
        return () => window.clearTimeout(id);
    }, [role, pathname]);

    // The explain line is read again when the refreshed theme commits; a replaced node drops it.
    useEffect(() => {
        const id = window.requestAnimationFrame(() => setExplained(picked?.target.isConnected ? explainText(picked.target, picked.el, picked.utility) : null));
        return () => window.cancelAnimationFrame(id);
    },[picked, designTheme]);

    // The draft is gone (published or discarded): the counter starts again.
    useEffect(() => { if (!draftActive) resetSaves(); }, [draftActive, resetSaves]);

    const tryPublish = () => {
        const sizes = resolveTypeRoles(theme.type, theme.headingFont, theme.bodyFont, theme.styleKey);
        const max = (id: TypeRoleId) => sizes.find((r) => r.id === id)?.maxPx ?? 0;
        if (max('item') >= max('title')) setWarn(true); else publish();
    };

    return (
        <>
            <RoleChip active={!paused} />
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
                <label className="block space-y-1">
                    <span className="text-meta text-foreground-muted">{t('role')}</span>
                    <Select value={role ?? ''} onChange={(e) => { setPicked(null); onSelect(e.target.value || null); }}>
                        <option value="">{t('pickPlaceholder')}</option>
                        {TYPE_ROLES.map((r) => <option key={r.id} value={r.id}>{tRoles(r.id)}</option>)}
                    </Select>
                </label>
                {role ? (
                    <div className="space-y-1">
                        <p className="text-item text-foreground">{tRoles(role)}</p>
                        {explained && <TextExplain role={role} explained={explained} type={theme.type} />}
                        <p className="text-meta text-foreground-muted">{t('onPage', { count })}</p>
                        <TypeRoleEditor roleId={role} type={theme.type} headingFont={theme.headingFont} bodyFont={theme.bodyFont} styleKey={theme.styleKey} disabled={false} onType={editType} />
                        <p className="text-meta text-foreground-muted">{t('everywhere')}</p>
                    </div>
                ) : (
                    <p className="text-body-sm text-foreground-muted">{t('noRole')}</p>
                )}
                <Link href="/admin/design?part=type" className={TEXT_LINK_CLASS}>{t('allType')} →</Link>
            </div>
            <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-body-sm">
                <span className="min-w-0 flex-1 truncate text-foreground-muted" aria-live="polite">{t('changes', { count: draftActive ? saves : 0 })}</span>
                <button type="button" disabled={!draftActive || isPending || busy} onClick={tryPublish} className={buttonClass('primary', '', 'sm')}>{t('publish')}</button>
                <button type="button" disabled={!draftActive || isPending || busy} onClick={discard} className={buttonClass('quiet', '', 'sm')}>{t('discard')}</button>
            </div>
            <ConfirmDialog
                isOpen={warn}
                title={t('publish')}
                message={t('orderWarning')}
                confirmLabel={t('publish')}
                isPending={isPending}
                onConfirm={() => { setWarn(false); publish(); }}
                onCancel={() => setWarn(false)}
            />
        </>
    );
}
