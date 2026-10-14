'use client';

import MonthCalendar from './MonthCalendar';
import QuickChoices from './QuickChoices';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/** What the phone's date button opens (OD-17): the quick choices above a thin line and the calendar. A quick choice applies and closes. */
export default function DateSheet({ onClose }: { onClose: () => void }) {
    const { go } = useDiscoveryNav();
    return (
        <div className="p-1">
            <QuickChoices variant="sheet" onPick={(date) => { go({ date, day: null }); onClose(); }} />
            <div className="my-3 border-t border-border" />
            <MonthCalendar onClose={onClose} />
        </div>
    );
}
