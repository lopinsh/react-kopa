import type { DemoGroup } from './types';
import { HOBBIES_GROUPS } from './groups-hobbies';
import { SOCIAL_GROUPS } from './groups-social';
import { SPORTS_GROUPS } from './groups-sports';
import { TRAVEL_GROUPS } from './groups-travel';
import { EDUCATION_GROUPS } from './groups-education';
import { GAMES_GROUPS } from './groups-games';
import { DANCING_GROUPS } from './groups-dancing';
import { MUSIC_GROUPS } from './groups-music';
import { WELLBEING_GROUPS } from './groups-wellbeing';
import { ART_GROUPS } from './groups-art';
import { PETS_GROUPS } from './groups-pets';
import { RELIGION_GROUPS } from './groups-religion';
import { FAMILY_GROUPS } from './groups-family';
import { POLITICS_GROUPS } from './groups-politics';
import { COMMUNITY_GROUPS } from './groups-community';

export { DEMO_L2S } from './taxonomy';
export { DEMO_USERS } from './users';
export * from './types';

/** All demo groups. One file per L1. */
export const DEMO_GROUPS: DemoGroup[] = [
  ...SOCIAL_GROUPS,
  ...HOBBIES_GROUPS,
  ...SPORTS_GROUPS,
  ...TRAVEL_GROUPS,
  ...EDUCATION_GROUPS,
  ...GAMES_GROUPS,
  ...DANCING_GROUPS,
  ...MUSIC_GROUPS,
  ...WELLBEING_GROUPS,
  ...ART_GROUPS,
  ...PETS_GROUPS,
  ...RELIGION_GROUPS,
  ...FAMILY_GROUPS,
  ...POLITICS_GROUPS,
  ...COMMUNITY_GROUPS,
];
