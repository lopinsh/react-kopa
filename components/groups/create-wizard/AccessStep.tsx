'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Globe, Lock, UserPlus } from 'lucide-react';
import type { GroupFormValues } from '@/lib/validations/group';

import { GROUP_TYPES as GLOBAL_GROUP_TYPES } from '@/lib/constants';

const GROUP_TYPE_OPTIONS = [
    {
        value: GLOBAL_GROUP_TYPES[0], // PUBLIC
        icon: Globe,
        labelKey: 'typePublic' as const,
        descKey: 'typePublicDesc' as const,
    },
    {
        value: GLOBAL_GROUP_TYPES[1], // PRIVATE
        icon: Lock,
        labelKey: 'typePrivate' as const,
        descKey: 'typePrivateDesc' as const,
    }
];

export default function AccessStep() {
    const t = useTranslations('wizard');
    const { register, watch, setValue, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {GROUP_TYPE_OPTIONS.map(({ value, icon: Icon, labelKey, descKey }) => {
                const isSelected = watch('type') === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setValue('type', value, { shouldValidate: true })}
                        className={clsx(
                            'flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all',
                            isSelected ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] shadow-control' : 'border-border hover:border-foreground-muted/40'
                        )}
                        aria-pressed={isSelected}
                    >
                        <div
                            className={clsx('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', isSelected && 'bg-primary')}
                            aria-hidden="true"
                        >
                            <Icon
                                className={clsx('h-4 w-4', isSelected ? 'text-primary-foreground' : 'text-foreground-muted')}
                                strokeWidth={1.75}
                            />
                        </div>
                        <div>
                            <p className="text-foreground text-body-sm">{t(labelKey)}</p>
                            <p className="mt-0.5 text-meta text-foreground-muted">{t(descKey)}</p>
                        </div>
                    </button>
                );
            })}
            {errors.type && <p className="mt-1 text-meta text-danger sm:col-span-2">{errors.type.message}</p>}

            <div className="mt-6 space-y-4 border-t border-border pt-6 sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('isAcceptingMembers')}
                            className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-pill bg-border transition-colors peer-checked:bg-primary" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-surface transition-transform peer-checked:translate-x-4 shadow-control" />
                    </div>
                    <div className="flex-1">
                        <span className="text-body-sm text-foreground">{t('acceptingMembers')}</span>
                    </div>
                    <UserPlus className={clsx(
                        "h-4 w-4 transition-colors",
                        watch('isAcceptingMembers') ? "text-primary" : "text-foreground-muted"
                    )} />
                </label>
            </div>
        </div>
    );
}
