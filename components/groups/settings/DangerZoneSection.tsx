'use client';

import { useTranslations } from 'next-intl';
import { Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import SettingsSection from './SettingsSection';

type Props = {
    onDelete: () => void;
    isPending: boolean;
};

export default function DangerZoneSection({ onDelete, isPending }: Props) {
    const gt = useTranslations('group');

    return (
        <SettingsSection
            title={gt('tabDanger')}
            description={gt('tabDangerDescription')}
            icon={AlertTriangle}
        >
            <div className="rounded-[40px] border border-red-500/10 bg-red-500/[0.02] p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-sm border border-red-500/5">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-black text-red-600 tracking-tight">{gt('deleteGroupTitle')}</h3>
                        <p className="text-base text-red-600/70 leading-relaxed max-w-xl font-medium">
                            {gt('deleteConfirm')}
                        </p>
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isPending}
                                className="flex h-12 items-center gap-3 rounded-2xl bg-red-600 px-8 font-black text-white transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-red-600/20"
                            >
                                <AlertCircle className="h-5 w-5" />
                                {gt('deleteButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
