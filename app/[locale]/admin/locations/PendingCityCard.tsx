'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { useDateFormatter } from '@/lib/date-format';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { approveCity, rejectCity } from '@/actions/city-actions';
import type { ActionResponse } from '@/types/actions';
import type { CityRow } from '@/lib/services/city.service';

type Props = { city: CityRow };

const INPUT = 'w-full bg-surface border border-border rounded px-3 py-2 text-sm';

/** A city suggested by a group creator: approve (names may be corrected) or reject. */
export default function PendingCityCard({ city }: Props) {
    const t = useTranslations('admin.taxonomy.inbox');
    const tFields = useTranslations('admin.taxonomy.fields');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const format = useDateFormatter();
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editing, setEditing] = useState(false);
    const [nameLv, setNameLv] = useState(city.nameLv);
    const [nameEn, setNameEn] = useState(city.nameEn);

    const run = (action: () => Promise<ActionResponse>, done: string) => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            if (res.success) {
                success(done);
                setEditing(false);
                router.refresh();
            } else {
                error(tErrors(res.error as 'ACTION_FAILED'));
            }
        });
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm" data-ui="pending-city-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-xl font-bold break-words">
                        <MapPin className="h-5 w-5 shrink-0 text-foreground-muted" />
                        {city.nameLv}
                    </h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {t('submittedBy', {
                            name: city.submittedBy?.username || city.submittedBy?.name || t('unknown'),
                            date: city.submittedAt ? format.dateTime(new Date(city.submittedAt), { dateStyle: 'medium' }) : '–',
                        })}
                    </p>
                    <p className="mt-1 text-sm font-medium">{t('cityGroups', { count: city.groupCount })}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setEditing(!editing)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated hover:bg-border'}`}
                    >
                        {c('approve')}
                    </button>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => { if (confirm(t('confirmRejectCity'))) run(() => rejectCity(city.id), c('reject') + ' - ' + c('success')); }}
                        className="px-3 py-1.5 text-sm font-semibold rounded text-danger bg-danger/10 hover:bg-danger/10 transition-colors disabled:opacity-50"
                    >
                        {c('reject')}
                    </button>
                </div>
            </div>

            {editing && (
                <div className="mt-4 rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground-muted">{tFields('nameLv')}</label>
                            <input type="text" value={nameLv} onChange={(e) => setNameLv(e.target.value)} maxLength={60} className={INPUT} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-foreground-muted">{tFields('nameEn')}</label>
                            <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={60} className={INPUT} />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-semibold text-foreground-muted hover:bg-border rounded transition-colors">
                            {c('cancel')}
                        </button>
                        <button
                            type="button"
                            disabled={isPending || nameLv.trim().length < 2 || nameEn.trim().length < 2}
                            onClick={() => run(() => approveCity(city.id, { nameLv, nameEn }), c('approve') + ' - ' + c('success'))}
                            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {c('confirm')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
