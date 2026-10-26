'use client';

import type { AdminPanelTab } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';
import DesignTab from './DesignTab';
import FeedbackTab from './FeedbackTab';
import TranslateTab from './TranslateTab';
import GroupTab from './group/GroupTab';

export type PanelTabProps = {
    /** Pause (Atsauksmes, Dizains): page clicks work normally. */
    paused: boolean;
    /** What the tab has selected (Tulkot: a message key, Dizains: a type role); Escape clears it before closing the panel. */
    selection: string | null;
    onSelect: (selection: string | null) => void;
    /** Dizains: a text was picked on the page; a phone sheet drops to half and shows it. */
    onPicked: (el: Element) => void;
};

/** The body of the open tab. */
export default function PanelTabBody({ tab, designTheme, draftActive, ...props }: PanelTabProps & { tab: AdminPanelTab; designTheme: ThemeInput | null; draftActive: boolean }) {
    if (tab === 'feedback') return <FeedbackTab {...props} />;
    if (tab === 'translate') return <TranslateTab {...props} />;
    if (tab === 'group') return <GroupTab />;
    if (tab === 'design' && designTheme) return <DesignTab {...props} designTheme={designTheme} draftActive={draftActive} />;
    return <div data-tab={tab} className="min-h-0 flex-1" />;
}
