'use client';

import { useTranslations } from 'next-intl';
import { GroupProvider, type GroupState } from '@/components/providers/GroupProvider';
import AccentScope from '@/components/handbook/AccentScope';
import GroupMoreMenu from '@/components/groups/GroupMoreMenu';

type Viewer = 'member' | 'pending' | 'visitor';

/** The "…" menu, open, for a member, a waiting request and a visitor side by side. Look only: report and write-to-team do nothing, leaving and withdrawing hit a sample id. */
export function GroupMenuDemo({ states, accent }: { states: Record<Viewer, GroupState>; accent: string }) {
    const t = useTranslations('admin.handbook.ui');
    const nothing = () => undefined;
    return (
        <AccentScope color={accent} className="grid gap-6 md:grid-cols-3">
            {(Object.keys(states) as Viewer[]).map((viewer) => (
                <div key={viewer}>
                    <p className="mb-2 text-sm text-foreground-muted">{t(`menuViewer.${viewer}`)}</p>
                    <div className="flex h-64 items-start justify-end">
                        <GroupProvider value={states[viewer]}>
                            <GroupMoreMenu initialOpen onReport={nothing} onWriteToTeam={nothing} />
                        </GroupProvider>
                    </div>
                </div>
            ))}
        </AccentScope>
    );
}
