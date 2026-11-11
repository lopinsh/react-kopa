'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import PartTabs from '@/components/ui/PartTabs';

const IDS = ['hub-activity', 'hub-notes', 'hub-events', 'hub-groups'] as const;
type Id = (typeof IDS)[number];
const LABELS: Record<Id, 'activity.title' | 'pages.messages' | 'pages.events' | 'pages.groups'> = {
    'hub-activity': 'activity.title', 'hub-notes': 'pages.messages', 'hub-events': 'pages.events', 'hub-groups': 'pages.groups',
};

/**
 * The tab row of Pārskats (K2-18): Aktivitāte / Ziņas / Pasākumi / Grupas, each an anchor to its block. The open tab is the block named in the address
 * hash, else Aktivitāte; a click scrolls to the block and writes the hash (no scroll-spy). Kur stays the menu's last item here (K-98).
 */
export default function OverviewTabs() {
    const t = useTranslations('hub');
    const [active, setActive] = useState<Id>('hub-activity');
    useEffect(() => {
        const read = () => {
            const id = window.location.hash.slice(1);
            setActive((IDS as readonly string[]).includes(id) ? (id as Id) : 'hub-activity');
        };
        read();
        window.addEventListener('hashchange', read);
        return () => window.removeEventListener('hashchange', read);
    }, []);

    const go = (key: string) => {
        document.getElementById(key)?.scrollIntoView({ block: 'start' });
        window.history.replaceState(null, '', `#${key}`);
        setActive(key as Id);
    };

    return <PartTabs label={t('overview.tabsLabel')} items={IDS.map((id) => ({ key: id, label: t(LABELS[id]), href: `#${id}` }))} active={active} onSelect={go} />;
}
