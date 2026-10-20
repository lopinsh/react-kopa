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
        <div className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-3.5 shadow-card frame">
            <div className="relative flex shrink-0 items-center">
                <input
                    type="checkbox"
                    {...register('isAcceptingMembers')}
                    id="isAcceptingMembers"
                    className="peer sr-only"
                />
                <label htmlFor="isAcceptingMembers" className="h-6 w-11 cursor-pointer rounded-pill bg-border transition-colors peer-checked:bg-primary" />
                <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
            <label htmlFor="isAcceptingMembers" className="min-w-0 flex-1 cursor-pointer">
                <span className="text-sm font-semibold text-foreground">{gt('acceptingMembersLabel')}</span>
                <p className="text-xs text-foreground-muted">{gt('acceptingMembersDesc')}</p>
            </label>
            <UserPlus className={clsx(
                'hidden h-6 w-6 shrink-0 transition-colors sm:block',
                watch('isAcceptingMembers') ? 'text-primary' : 'text-foreground-muted'
            )} />
        </div>
    );
}
