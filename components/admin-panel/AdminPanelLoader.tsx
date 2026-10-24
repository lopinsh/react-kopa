'use client';

import dynamic from 'next/dynamic';
import type { AdminPanelTab } from '@/lib/constants';

// Loaded on demand, so the panel and the tabs are only downloaded when the server renders them for a site admin.
const AdminPanel = dynamic(() => import('./AdminPanel'), { ssr: false });

export default function AdminPanelLoader({ tab, draftActive }: { tab: AdminPanelTab; draftActive: boolean }) {
    return <AdminPanel tab={tab} draftActive={draftActive} />;
}
