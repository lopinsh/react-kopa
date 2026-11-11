'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import PartTabs from '@/components/ui/PartTabs';

/**
 * The tab row of Pārskats (K2-18): Aktivitāte / Ziņas / Pasākumi / Grupas on a hub, Aktivitāte / Ziņas / Pilsētas istabas on a city hub, each an anchor to its block. The open tab is the block named in the address
 * hash, else the first; a click scrolls to the block and writes the hash (no scroll-spy). Kur stays the menu's last item here (K-98).
 */
export default function OverviewTabs({ items }: { items: Array<{ id: string; label: string }> }) {
    const t = useTranslations('hub');
    const idList = items.map((i) => i.id).join(',');
    const [active, setActive] = useState<string>(items[0].id);
    useEffect(() => {
        const ids = idList.split(',');
        const read = () => {
            const id = window.location.hash.slice(1);
            setActive(ids.includes(id) ? id : ids[0]);
        };
        read();
        window.addEventListener('hashchange', read);
        return () => window.removeEventListener('hashchange', read);
    }, [idList]);

    const go = (key: string) => {
        document.getElementById(key)?.scrollIntoView({ block: 'start' });
        window.history.replaceState(null, '', `#${key}`);
        setActive(key);
    };

    return <PartTabs width="full" label={t('overview.tabsLabel')} items={items.map(({ id, label }) => ({ key: id, label, href: `#${id}` }))} active={active} onSelect={go} />;
}
