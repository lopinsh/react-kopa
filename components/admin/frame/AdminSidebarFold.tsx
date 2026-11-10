'use client';

import { useId, useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { SidebarList, type SidebarLabels, type SidebarSection, type SidebarTab } from './AdminSidebarLayout';

/** Below `lg` the sidebar folds into a "Sections" button above the content; the panel opens in flow, choosing a row closes it (AF-14). */
export default function AdminSidebarFold({ tabs, sections, current, labels, onJump }: { tabs: SidebarTab[]; sections: SidebarSection[]; current: string | null; labels: SidebarLabels; onJump?: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const panelId = useId();
    if (tabs.length === 0 && sections.length === 0) return null;
    return (
        <div className="py-3 lg:hidden">
            <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)} className={buttonClass('quiet', 'gap-2', 'sm')}>
                {labels.sections}
                <ChevronDown aria-hidden className={clsx('size-4 motion-safe:transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div id={panelId} className="mt-2 rounded-2xl line bg-surface p-2">
                    <SidebarList tabs={tabs} sections={sections} current={current} labels={labels} onJump={onJump} onPick={() => setOpen(false)} />
                </div>
            )}
        </div>
    );
}
