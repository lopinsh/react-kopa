import { cache } from 'react';
import { getAdminPanelTab } from '@/lib/admin-panel/server';

/** Translation mode is the panel's Tulkot tab, and only for a site admin (the cookie is checked in getAdminPanelTab). */
export const isTranslateModeActive = cache(async (): Promise<boolean> => (await getAdminPanelTab()) === 'translate');
