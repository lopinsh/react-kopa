'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import { type GroupFormValues } from '@/lib/validations/group';

/** Switch: whether new people can ask to join. Owner tab. */
export default function AcceptingMembersSection() {
    const gt = useTranslations('group');
    const { register, watch } = useFormContext<GroupFormValues>();

    return (
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-surface-elevated/10 p-5 transition-all hover:bg-surface-elevated/20 sm:p-6">
            <div className="relative flex shrink-0 items-center">
                <input
                    type="checkbox"
                    {...register('isAcceptingMembers')}
                    id="isAcceptingMembers"
                    className="peer sr-only"
                />
                <label htmlFor="isAcceptingMembers" className="h-6 w-11 cursor-pointer rounded-full bg-border transition-colors peer-checked:bg-[var(--accent)]" />
                <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
            <label htmlFor="isAcceptingMembers" className="min-w-0 flex-1 cursor-pointer">
                <span className="text-sm font-black text-foreground">{gt('acceptingMembersLabel')}</span>
                <p className="text-xs text-foreground-muted">{gt('acceptingMembersDesc')}</p>
            </label>
            <UserPlus className={clsx(
                'hidden h-6 w-6 shrink-0 transition-colors sm:block',
                watch('isAcceptingMembers') ? 'text-[var(--accent)]' : 'text-foreground-muted'
            )} />
        </div>
    );
}
