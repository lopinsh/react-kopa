'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Flag, Lightbulb, MessageSquare } from 'lucide-react';
import { getShieldCounts } from '@/actions/admin-panel-actions';
import { MenuItemLink } from '@/components/ui/Menu';
import type { ShieldCounts } from '@/lib/services/admin.service';

// The last numbers seen: a second open shows them at once, then the read updates them.
let lastCounts: ShieldCounts | null = null;

/** The three admin queues with what waits in each (0 or not loaded: no number, the row stays). */
export default function AdminMenuQueues() {
    const t = useTranslations('nav');
    const [counts, setCounts] = useState<ShieldCounts | null>(lastCounts);

    useEffect(() => {
        let alive = true;
        void getShieldCounts().then((res) => {
            if (!res.success || !res.data) return;
            lastCounts = res.data;
            if (alive) setCounts(res.data);
        });
        return () => { alive = false; };
    }, []);

    const suggestions = (counts?.themes ?? 0) + (counts?.cities ?? 0);
    const suggestionsHref = counts && counts.themes === 0 && counts.cities > 0 ? '/admin/locations' : '/admin/categories';
    const count = (n: number): ReactNode => n > 0 && (
        <>
            <span className="ml-auto text-meta tabular-nums text-foreground-muted" aria-hidden>{n}</span>
            <span className="sr-only">{t('queueWaiting', { count: n })}</span>
        </>
    );
    const icon = 'size-4 text-foreground-muted';

    return (
        <>
            <MenuItemLink href="/admin/reports" icon={<Flag aria-hidden className={icon} />} trailing={count(counts?.reports ?? 0)}>{t('queueReports')}</MenuItemLink>
            <MenuItemLink href="/admin/feedback" icon={<MessageSquare aria-hidden className={icon} />} trailing={count(counts?.feedback ?? 0)}>{t('queueFeedback')}</MenuItemLink>
            <MenuItemLink href={suggestionsHref} icon={<Lightbulb aria-hidden className={icon} />} trailing={count(suggestions)}>{t('queueSuggestions')}</MenuItemLink>
        </>
    );
}
