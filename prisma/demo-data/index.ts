import type { DemoGroup } from './types';
import { HOBBIES_GROUPS } from './groups-hobbies';
import { SOCIAL_GROUPS } from './groups-social';
import { SPORTS_GROUPS } from './groups-sports';
import { TRAVEL_GROUPS } from './groups-travel';
import { EDUCATION_GROUPS } from './groups-education';
import { GAMES_GROUPS } from './groups-games';
import { DANCING_GROUPS } from './groups-dancing';
import { MUSIC_GROUPS } from './groups-music';

export { DEMO_L2S } from './taxonomy';
export { DEMO_USERS } from './users';
export * from './types';

/** All demo groups. Later sessions append their L1 files here. */
export const DEMO_GROUPS: DemoGroup[] = [
  ...SOCIAL_GROUPS,
  ...HOBBIES_GROUPS,
  ...SPORTS_GROUPS,
  ...TRAVEL_GROUPS,
  ...EDUCATION_GROUPS,
  ...GAMES_GROUPS,
  ...DANCING_GROUPS,
  ...MUSIC_GROUPS,
];
