'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import PartTabs from '@/components/ui/PartTabs';
import { useSectionInView } from '@/hooks/useSectionInView';
import { UI } from '@/lib/constants';

/**
 * The sections of Manas grupas as a menu (AR-61): the part-tab look, sticky under the header, marking the section being read.
 * A tap scrolls to the section (smooth unless motion is reduced) and writes its `#` into the address without navigating.
 */
export default function SectionMenu({ sections }: { sections: Array<{ key: string; label: string }> }) {
    const t = useTranslations('profile.myGroups');
    const barRef = useRef<HTMLDivElement>(null);
    const active = useSectionInView(sections.map((s) => s.key), barRef);

    const select = (key: string) => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.getElementById(key)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(window.history.state, '', `#${key}`);
    };

    return (
        // The shell scrolls the area under the header, so `top-0` holds the menu right under the header bar.
        <div ref={barRef} data-ui={UI.sectionMenu} className="sticky top-0 z-10 -mt-1 bg-background pt-1">
            <PartTabs label={t('menuLabel')} items={sections.map((s) => ({ key: s.key, label: s.label, href: `#${s.key}` }))} active={active} onSelect={select} />
        </div>
    );
}
