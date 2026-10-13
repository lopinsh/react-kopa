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
  const c_common = useTranslations('common');

    return (
        <SettingsSection
            title={c_common('tabDanger')}
            description={c_common('tabDangerDescription')}
            icon={AlertTriangle}
        >
            <div className="rounded-3xl border border-danger/40 bg-danger/[0.02] p-5 sm:p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start gap-5 md:gap-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger shadow-sm border border-danger/40">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl sm:text-2xl font-black text-danger tracking-tight">{c_common('deleteGroupTitle')}</h3>
                        <p className="text-base text-danger/70 leading-relaxed max-w-xl font-medium">
                            {gt('deleteConfirm')}
                        </p>
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isPending}
                                className="flex h-12 items-center gap-3 rounded-full bg-danger px-8 font-black text-danger-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-danger/20"
                            >
                                <AlertCircle className="h-5 w-5" />
                                {c_common('deleteGroupTitle')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
