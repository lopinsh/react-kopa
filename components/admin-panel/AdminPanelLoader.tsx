'use client';

import dynamic from 'next/dynamic';
import type { AdminPanelTab } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';

// Loaded on demand, so the panel and the tabs are only downloaded when the server renders them for a site admin.
const AdminPanel = dynamic(() => import('./AdminPanel'), { ssr: false });

/** `designTheme` (the draft or published theme) is sent only while the Dizains tab is open. */
export default function AdminPanelLoader({ tab, draftActive, designTheme }: { tab: AdminPanelTab; draftActive: boolean; designTheme: ThemeInput | null }) {
    return <AdminPanel tab={tab} draftActive={draftActive} designTheme={designTheme} />;
}
