'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import SettingsSection from './SettingsSection';

type Props = {
    onDelete: () => void;
    isPending: boolean;
};

export default function DangerZoneSection({ onDelete, isPending }: Props) {
    const gt = useTranslations('group');
    const c_common = useTranslations('common');

    return (
        <SettingsSection title={c_common('tabDanger')} description={c_common('tabDangerDescription')}>
            <div className="space-y-3">
                <p className="max-w-xl text-sm text-foreground-muted">{gt('deleteConfirm')}</p>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isPending}
                    className="flex h-12 items-center gap-3 rounded-full bg-danger px-8 font-semibold text-danger-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                    <Trash2 className="h-5 w-5" />
                    {c_common('deleteGroupTitle')}
                </button>
            </div>
        </SettingsSection>
    );
}
