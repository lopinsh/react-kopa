'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import SettingsSection from './SettingsSection';
import Button from '@/components/ui/Button';

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
                <p className="max-w-xl text-body-sm text-foreground">{gt('deleteConfirm')}</p>
                <Button variant="danger"
                    type="button"
                    onClick={onDelete}
                    disabled={isPending}
                >
                    <Trash2 className="size-5" />
                    {c_common('deleteGroupTitle')}
                </Button>
            </div>
        </SettingsSection>
    );
}
