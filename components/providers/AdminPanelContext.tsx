'use client';

import { createContext, useContext } from 'react';
import type { AdminPanelTab } from '@/lib/constants';

const AdminPanelContext = createContext<AdminPanelTab | null>(null);

export const AdminPanelProvider = AdminPanelContext.Provider;

/** The tab of the admin tool panel that is open, or null (decided on the server, per request; only site admins ever get a tab). */
export function useAdminPanelTab(): AdminPanelTab | null {
    return useContext(AdminPanelContext);
}
