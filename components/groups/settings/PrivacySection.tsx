'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Globe, Lock as LockIcon } from 'lucide-react';
import { type GroupFormValues } from '@/lib/validations/group';
import { clsx } from 'clsx';
import SettingsSection from './SettingsSection';

export default function PrivacySection() {
    const gt = useTranslations('group');
  const c_common = useTranslations('common');
    const { register, watch } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={c_common('tabPrivacy')}
            description={c_common('tabPrivacyDescription')}
            icon={LockIcon}
        >
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                {[
                    { id: 'PUBLIC', icon: Globe, label: c_common('public'), desc: c_common('visibilityPublicDesc') },
                    { id: 'PRIVATE', icon: LockIcon, label: c_common('visibilityMembersOnly'), desc: c_common('visibilityMembersOnlyDesc') },
                ].map((type) => (
                    <label
                        key={type.id}
                        className={clsx(
                            "relative flex cursor-pointer flex-col rounded-3xl border-2 p-6 transition-all text-left group",
                            watch('type') === type.id
                                ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-lg ring-4 ring-[var(--accent)]/5"
                                : "border-border bg-surface hover:border-[var(--accent)]/50 hover:bg-surface-elevated/5"
                        )}
                    >
                        <input
                            type="radio"
                            value={type.id}
                            {...register('type')}
                            className="sr-only"
                        />
                        <div className="flex items-center gap-4 mb-3">
                            <div className={clsx(
                                "flex h-10 w-10 items-center justify-center rounded-xl transition-all border shadow-sm",
                                watch('type') === type.id
                                    ? "bg-[var(--accent)] text-white border-transparent scale-110 shadow-[var(--accent)]/20 shadow-md"
                                    : "bg-surface-elevated text-foreground-muted border-border group-hover:text-foreground group-hover:border-[var(--accent)]/30"
                            )}>
                                <type.icon className="h-5 w-5" />
                            </div>
                            <span className="font-black text-lg text-foreground tracking-tight">{type.label}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground-muted opacity-80 pl-1">{type.desc}</p>
                    </label>
                ))}
            </div>
        </SettingsSection>
    );
}
