'use client';

import { useId, useState, useTransition, type Ref } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { hideGroup, restoreGroup } from '@/actions/moderation-actions';
import { useToast } from '@/hooks/use-toast';
import { Link, useRouter } from '@/i18n/routing';
import type { AdminGroupRef } from '@/components/providers/AdminGroupContext';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { hideGroupSchema } from '@/lib/validations/moderation';

type Props = { group: AdminGroupRef; reasonRef: Ref<HTMLTextAreaElement>; restoreRef: Ref<HTMLButtonElement> };

/** Hide with a typed reason, or restore; then the two edit links. Deleting stays in Admin > Moderācija. */
export default function GroupTabActions({ group, reasonRef, restoreRef }: Props) {
    const t = useTranslations('admin.panel.group');
    const tMod = useTranslations('moderation');
    const tAdmin = useTranslations('adminTools');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const fieldId = useId();
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const fail = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const hide = () => {
        if (isPending) return;
        if (!hideGroupSchema.safeParse({ reason }).success) { setError(tErrors('VALIDATION_FAILED')); return; }
        setError(null);
        startTransition(async () => {
            const res = await hideGroup(group.id, reason, locale);
            if (!res.success) { fail(res.error); return; }
            success(tMod('hiddenToast'));
            setReason('');
            router.refresh();
        });
    };
    const restore = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await restoreGroup(group.id, locale);
            if (!res.success) { fail(res.error); return; }
            success(tMod('restoredToast'));
            router.refresh();
        });
    };

    return (
        <section className="flex flex-col gap-3 px-4 py-3">
            {group.canHide ? (
                <div className="flex flex-col gap-2">
                    <p className="text-meta text-foreground-muted">{t('hideNote')}</p>
                    <label htmlFor={fieldId} className="text-button-sm text-foreground">{tMod('reasonLabel')}</label>
                    <Textarea
                        id={fieldId}
                        ref={reasonRef}
                        rows={3}
                        value={reason}
                        disabled={isPending}
                        aria-invalid={error ? true : undefined}
                        placeholder={tMod('reasonPlaceholder')}
                        onChange={(e) => { setReason(e.target.value); setError(null); }}
                    />
                    <p className={error ? 'text-meta text-danger' : 'text-meta text-foreground-muted'}>{error ?? tMod('reasonHint')}</p>
                    <Button variant="danger" size="sm" disabled={isPending} onClick={hide} className="self-start">{tMod('hideGroup')}</Button>
                </div>
            ) : group.hidden ? (
                <div className="flex flex-col gap-2">
                    <Button ref={restoreRef} variant="secondary" size="sm" disabled={isPending} onClick={restore} className="self-start">{tMod('restore')}</Button>
                    <Link href="/admin?tab=moderation" className="text-meta text-foreground-muted hover:underline">{t('deleteWhere')}</Link>
                </div>
            ) : (
                <p className="text-meta text-foreground-muted">{t('ownGroup')}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-meta">
                <Link href={`/admin/groups/${group.l1Slug}/${group.slug}/categorization`} className="min-h-8 text-primary hover:underline">{tAdmin('fixCategorization')}</Link>
                <Link href={`${group.href}/settings`} className="min-h-8 text-primary hover:underline">{tAdmin('editGroup')}</Link>
            </div>
        </section>
    );
}
