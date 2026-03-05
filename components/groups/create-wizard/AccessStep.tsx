'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Globe, Lock, Zap, HelpCircle, UserPlus, MessageSquare, Instagram as InstagramIcon } from 'lucide-react';
import type { GroupFormValues } from '@/lib/validations/group';
import RichTextEditor from '@/components/ui/RichTextEditor';

import { GROUP_TYPES as GLOBAL_GROUP_TYPES } from '@/lib/constants';

const GROUP_TYPE_OPTIONS = [
    {
        value: GLOBAL_GROUP_TYPES[0], // PUBLIC
        icon: Globe,
        labelKey: 'typePublic',
        descKey: 'typePublicDesc',
    },
    {
        value: GLOBAL_GROUP_TYPES[1], // PRIVATE
        icon: Lock,
        labelKey: 'typePrivate',
        descKey: 'typePrivateDesc',
    }
];

type Props = {
    accentColor: string;
};

export default function AccessStep({ accentColor }: Props) {
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
                        onClick={() => setValue('type', value as any, { shouldValidate: true })}
                        className={clsx(
                            'flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all',
                            isSelected ? 'shadow-sm' : 'border-border hover:border-foreground-muted/40'
                        )}
                        style={isSelected ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : undefined}
                        aria-pressed={isSelected}
                    >
                        <div
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: isSelected ? accentColor : undefined }}
                            aria-hidden="true"
                        >
                            <Icon
                                className={clsx('h-4 w-4', isSelected ? 'text-white' : 'text-foreground-muted')}
                                strokeWidth={1.75}
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">{t(labelKey as any)}</p>
                            <p className="mt-0.5 text-[10px] leading-tight text-foreground-muted">{t(descKey as any)}</p>
                        </div>
                    </button>
                );
            })}
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}

            <div className="mt-6 space-y-4 pt-6 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('isAcceptingMembers')}
                            className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-full bg-border transition-colors peer-checked:bg-[var(--accent)]" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 shadow-sm" />
                    </div>
                    <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">{t('acceptingMembers')}</span>
                    </div>
                    <UserPlus className={clsx(
                        "h-4 w-4 transition-colors",
                        watch('isAcceptingMembers') ? "text-[var(--accent)]" : "text-foreground-muted"
                    )} />
                </label>
            </div>
        </div>
    );
}
