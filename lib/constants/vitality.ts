/** Admin vitality panel (R31): what the numbers cover. */
export { DEMO_EMAIL_DOMAIN } from '@/prisma/demo-data/types';

/** Growth tiles, in tile order. */
export const VITALITY_SERIES = ['users', 'groups', 'joins', 'events', 'signups'] as const;
export type VitalitySeriesKey = (typeof VITALITY_SERIES)[number];

/** Weeks drawn in each tile's bar chart. */
export const VITALITY_WEEKS = 12;
/** A group with a sign of life this recent is active. */
export const VITALITY_ACTIVE_DAYS = 30;
/** "Groups with 3 or more members". */
export const VITALITY_MIN_MEMBERS = 3;
/** Quiet groups listed before "and N more". */
export const VITALITY_QUIET_LIMIT = 50;
