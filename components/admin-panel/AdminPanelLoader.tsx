'use client';

import dynamic from 'next/dynamic';
import type { AdminMode, AdminPanelTab } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';

// Loaded on demand, so the panel and the tabs are only downloaded when the server renders them for a site admin.
const AdminPanel = dynamic(() => import('./AdminPanel'), { ssr: false });

/** `designTheme` (the draft or published theme) is sent only while the Dizains tab is open. */
export default function AdminPanelLoader({ tab, mode, draftActive, designTheme }: { tab: AdminPanelTab; mode: AdminMode | null; draftActive: boolean; designTheme: ThemeInput | null }) {
    return <AdminPanel tab={tab} mode={mode} draftActive={draftActive} designTheme={designTheme} />;
}
