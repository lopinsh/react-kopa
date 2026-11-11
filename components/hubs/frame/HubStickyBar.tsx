'use client';

import { useHubContext } from '@/components/providers/HubProvider';
import HubPagesDrawer from './HubPagesDrawer';
import PagesStickyBar from './PagesStickyBar';

/** The phone bar of a hub (see `PagesStickyBar`). */
export default function HubStickyBar() {
    const hub = useHubContext();
    return <PagesStickyBar name={hub.name} drawer={<HubPagesDrawer />} />;
}
