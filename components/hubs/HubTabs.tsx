import PartTabs from '@/components/ui/PartTabs';
import HubPlaceButton from './frame/HubPlaceButton';

/** The tab row of a hub page without a title above it (K-110), with Kur at its end (K-98). */
export default function HubTabs({ label, items, active }: { label: string; items: Array<{ key: string; label: string; href: string }>; active: string }) {
    return <PartTabs label={label} items={items} active={active} action={<HubPlaceButton />} />;
}
