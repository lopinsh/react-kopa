'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Activity } from 'lucide-react';
import FilterChip from '@/components/ui/FilterChip';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { ACTIVITY_FILTERS, type ActivityFilter } from '@/lib/constants/activity';
import { loadActivity } from '@/actions/activity';
import type { ActivityPage } from '@/lib/services/activity.service';
import ActivityRow from './ActivityRow';

type Props = { filter: ActivityFilter; initial: ActivityPage };

/** The admin activity feed: filter chips, one card of sentence rows, "show more" by cursor. The page keys it by filter, so a new filter starts fresh. */
export default function ActivityFeed({ filter, initial }: Props) {
    const t = useTranslations('admin.activity');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const params = useSearchParams();
    const { error: toastError } = useToast();
    const [page, setPage] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const [isFiltering, startFilter] = useTransition();

    const pick = (next: ActivityFilter) => {
        if (next === filter || isFiltering) return;
        {
            const query = new URLSearchParams(params.toString());
            if (next === 'all') query.delete('type');
            else query.set('type', next);
            startFilter(() => router.replace(`?${query.toString()}`, { scroll: false }));
        }
    };

    const more = () => {
        if (isPending || !page.nextCursor) return;
        const cursor = page.nextCursor;
        startTransition(async () => {
            const res = await loadActivity({ type: filter, cursor });
            if (res.success && res.data) {
                const next = res.data;
                setPage((prev) => ({ entries: [...prev.entries, ...next.entries], nextCursor: next.nextCursor }));
            } else if (!res.success) {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : t('loadFailed'));
            }
        });
    };

    return (
        <div className="space-y-4">
            <div role="group" aria-label={t('filtersLabel')} className="flex flex-wrap gap-2">
                {ACTIVITY_FILTERS.map((f) => (
                    <FilterChip key={f} active={f === filter} onClick={() => pick(f)}>{t(`filter.${f}`)}</FilterChip>
                ))}
            </div>
            {page.entries.length === 0 ? (
                <EmptyState icon={Activity} title={t('empty')} />
            ) : (
                <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
                    {page.entries.map((entry) => <ActivityRow key={entry.key} entry={entry} />)}
                </ul>
            )}
            {page.nextCursor && (
                <div className="flex justify-center">
                    <Button variant="secondary" onClick={more} disabled={isPending}>{t('more')}</Button>
                </div>
            )}
        </div>
    );
}
