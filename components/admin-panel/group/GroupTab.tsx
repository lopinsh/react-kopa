'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getGroupPanelData } from '@/actions/admin-panel-actions';
import { useAdminGroup } from '@/components/providers/AdminGroupContext';
import type { GroupPanelData } from '@/lib/services/group-panel';
import { takePanelFocus } from '../panel-storage';
import GroupTabStatus from './GroupTabStatus';
import GroupTabFacts from './GroupTabFacts';
import GroupTabActions from './GroupTabActions';
import GroupTabReports from './GroupTabReports';
import GroupTabLog from './GroupTabLog';

/** The Grupa tab: the open group's status, facts, hide or restore, reports and log. Fetched when the tab opens and after a hide or restore. */
export default function GroupTab() {
    const t = useTranslations('admin.panel.group');
    const locale = useLocale();
    const group = useAdminGroup();
    const [data, setData] = useState<GroupPanelData | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const reasonRef = useRef<HTMLTextAreaElement>(null);
    const restoreRef = useRef<HTMLButtonElement>(null);
    const reportsRef = useRef<HTMLParagraphElement>(null);
    const groupId = group?.id;
    const hidden = group?.hidden;

    useEffect(() => {
        if (!groupId) return;
        let stale = false;
        void getGroupPanelData(groupId, locale).then((res) => {
            if (stale) return;
            setFailed(!res.success);
            if (res.success && res.data) setData(res.data);
        });
        return () => { stale = true; };
    }, [groupId, hidden, locale, attempt]);

    const current = data && data.id === groupId ? data : null;

    // The shield's one-shot request (R25-3): put the cursor where the admin meant to work.
    const focusRequested = useCallback(() => {
        const target = takePanelFocus();
        if (target === 'hideReason') reasonRef.current?.focus();
        else if (target === 'restore') restoreRef.current?.focus();
        else if (target === 'reports') { reportsRef.current?.scrollIntoView({ block: 'nearest' }); reportsRef.current?.focus(); }
    }, []);
    useEffect(() => {
        if (current) focusRequested();
        window.addEventListener('ek:admin-panel-focus', focusRequested);
        return () => window.removeEventListener('ek:admin-panel-focus', focusRequested);
    }, [current, focusRequested]);

    if (!group) return <p className="px-4 py-3 text-meta text-foreground-muted">{t('none')}</p>;
    if (failed && !current) {
        return (
            <div className="flex flex-col items-start gap-2 px-4 py-3">
                <p className="text-meta text-foreground-muted">{t('loadFailed')}</p>
                <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-meta text-primary hover:underline">{t('retry')}</button>
            </div>
        );
    }
    if (!current) return <p aria-busy className="px-4 py-3 text-meta text-foreground-muted">…</p>;

    return (
        <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto">
            <GroupTabStatus data={current} />
            <GroupTabFacts data={current} />
            <GroupTabActions group={group} reasonRef={reasonRef} restoreRef={restoreRef} />
            <GroupTabReports reports={current.reports} labelRef={reportsRef} />
            <GroupTabLog log={current.log} groupId={current.id} />
        </div>
    );
}
