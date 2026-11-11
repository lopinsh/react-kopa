import type { ReactNode } from 'react';
import PartTabs from '@/components/ui/PartTabs';
import HubPlaceButton from './frame/HubPlaceButton';

/** The tab row of a hub page without a title above it (K-110), with Kur at its end (K-98). */
export default function HubTabs({ label, items, active, before, kur = true }: { label: string; items: Array<{ key: string; label: string; href: string }>; active: string; /** Sits left of Kur (the Ziņas search, from 1024 px). */ before?: ReactNode; /** False on a city hub: it has no Kur (K-10). */ kur?: boolean }) {
    const place = kur ? <HubPlaceButton /> : null;
    return <PartTabs label={label} items={items} active={active} action={before ? <div className="flex items-center gap-2">{before}{place}</div> : place} />;
}
