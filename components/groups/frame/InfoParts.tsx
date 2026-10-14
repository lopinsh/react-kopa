'use client';

import { useState, type ReactNode } from 'react';
import GroupPartTabs from './GroupPartTabs';

type Part = { key: string; label: string; lang?: string; href: string; content: ReactNode };

/**
 * Informācija's parts (AR-50): every part this viewer may read is on the page, one shown. A tab switches without loading and writes `?part=`
 * with replaceState (still shareable), so no navigation happens inside the group's own address (R6: that address would open as a panel).
 */
export default function InfoParts({ title, label, parts, initial }: { title: string; label: string; parts: Part[]; initial: string }) {
    const [active, setActive] = useState(initial);
    const select = (key: string) => {
        setActive(key);
        const first = parts[0]?.key === key;
        window.history.replaceState(window.history.state, '', first ? window.location.pathname : `?part=${key}`);
    };
    return (
        <>
            <GroupPartTabs title={title} label={label} items={parts.map(({ key, label: text, lang, href }) => ({ key, label: text, lang, href }))} active={active} onSelect={select} />
            {parts.map((p) => <div key={p.key} hidden={p.key !== active}>{p.content}</div>)}
        </>
    );
}
