'use client';

import { useHubContext } from '@/components/providers/HubProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import PagesDrawer from './PagesDrawer';
import HubPagesNav from './HubPagesNav';

/** The ☰ pages drawer of a hub: its name, Tēma mark and pages. */
export default function HubPagesDrawer({ onTone = false }: { onTone?: boolean }) {
    const hub = useHubContext();
    return <PagesDrawer onTone={onTone} name={hub.name} icon={<CategoryIcon slug={hub.l1Slug} aria-hidden className="size-5" />} nav={<HubPagesNav variant="drawer" />} />;
}
