import { cache } from 'react';
import { getAdminPanelTab } from '@/lib/admin-panel/server';

/** Feedback mode is the panel's Atsauksmes tab, and only for a site admin (the cookie is checked in getAdminPanelTab). */
export const isFeedbackModeActive = cache(async (): Promise<boolean> => (await getAdminPanelTab()) === 'feedback');
