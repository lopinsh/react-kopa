import { z } from 'zod';
import { ADMIN_PANEL_TABS } from '@/lib/constants';

export const adminPanelTabSchema = z.enum(ADMIN_PANEL_TABS).nullable();
