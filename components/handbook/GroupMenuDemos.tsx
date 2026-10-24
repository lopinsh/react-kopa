'use client';

import { useTranslations } from 'next-intl';
import { GroupProvider, type GroupState } from '@/components/providers/GroupProvider';
import AccentScope from '@/components/handbook/AccentScope';
import GroupMenuActions from '@/components/groups/frame/GroupMenuActions';

type Viewer = 'member' | 'pending' | 'visitor';

/** The group menu's action rows for a member, a waiting request and a visitor side by side. Look only: report and write-to-team do nothing (no dialogs host), leaving and withdrawing hit a sample id. */
export function GroupMenuDemo({ states, accent }: { states: Record<Viewer, GroupState>; accent: string }) {
    const t = useTranslations('admin.handbook.ui');
    return (
        <AccentScope color={accent} className="grid gap-6 md:grid-cols-3">
            {(Object.keys(states) as Viewer[]).map((viewer) => (
                <div key={viewer}>
                    <p className="mb-2 text-body-sm text-foreground-muted">{t(`menuViewer.${viewer}`)}</p>
                    <div className="max-w-64">
                        <GroupProvider value={states[viewer]}>
                            <GroupMenuActions />
                        </GroupProvider>
                    </div>
                </div>
            ))}
        </AccentScope>
    );
}
