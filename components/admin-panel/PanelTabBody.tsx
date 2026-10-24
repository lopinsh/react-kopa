'use client';

import type { AdminPanelTab } from '@/lib/constants';
import FeedbackTab from './FeedbackTab';

export type PanelTabProps = {
    /** Pause (Atsauksmes, Dizains): page clicks work normally. */
    paused: boolean;
    /** What the tab has selected (Tulkot: a message key); Escape clears it before closing the panel. */
    selection: string | null;
    onSelect: (selection: string | null) => void;
};

/** The body of the open tab. */
export default function PanelTabBody({ tab, ...props }: PanelTabProps & { tab: AdminPanelTab }) {
    if (tab === 'feedback') return <FeedbackTab {...props} />;
    return <div data-tab={tab} className="min-h-0 flex-1" />;
}
