'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { typeRoleOfElement, type TypeRoleId } from '@/lib/constants';

type Spot = { role: TypeRoleId; x: number; y: number };

/** Hover chip: the role name at the top-left of the text under a mouse or pen. Position goes through CSS variables. */
export default function RoleChip({ active }: { active: boolean }) {
    const t = useTranslations('admin.design.type.roles');
    const [spot, setSpot] = useState<Spot | null>(null);

    useEffect(() => {
        if (!active) return;
        const over = (e: PointerEvent) => {
            if (e.pointerType === 'touch' || !(e.target instanceof Element)) return;
            const hit = typeRoleOfElement(e.target);
            if (!hit) { setSpot(null); return; }
            const r = hit.el.getBoundingClientRect();
            setSpot({ role: hit.role, x: Math.max(4, r.left), y: Math.max(4, r.top - 22) });
        };
        const out = (e: PointerEvent) => { if (!e.relatedTarget) setSpot(null); };
        document.addEventListener('pointerover', over);
        document.addEventListener('pointerout', out);
        return () => {
            document.removeEventListener('pointerover', over);
            document.removeEventListener('pointerout', out);
        };
    }, [active]);

    if (!active || !spot) return null;
    return (
        <span
            aria-hidden
            data-admin-panel
            style={{ '--chip-x': `${spot.x}px`, '--chip-y': `${spot.y}px` } as React.CSSProperties}
            className="pointer-events-none fixed left-[var(--chip-x)] top-[var(--chip-y)] z-[57] rounded-pill bg-primary px-2 text-tag text-primary-foreground"
        >
            {t(spot.role)}
        </span>
    );
}
