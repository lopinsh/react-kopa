'use client';

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
    const active = useSectionInView(sections.map((s) => s.key));

    const select = (key: string) => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.getElementById(key)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(window.history.state, '', `#${key}`);
    };

    return (
        <div data-ui={UI.sectionMenu} className="sticky top-[var(--header-height)] z-10 -mt-1 bg-background pt-1">
            <PartTabs label={t('menuLabel')} items={sections.map((s) => ({ key: s.key, label: s.label, href: `#${s.key}` }))} active={active} onSelect={select} />
        </div>
    );
}
