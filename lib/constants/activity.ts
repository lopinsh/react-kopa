/** Admin activity feed (R30). Kinds in tie-break rank order. */
export const ACTIVITY_KINDS = [
    'USER_JOINED',
    'GROUP_CREATED',
    'MEMBER_JOINED',
    'MEMBER_REQUESTED',
    'EVENT_CREATED',
    'EVENT_SIGNUP',
    'POST_PUBLISHED',
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const ACTIVITY_FILTER_KINDS = {
    all: ACTIVITY_KINDS,
    users: ['USER_JOINED'],
    groups: ['GROUP_CREATED'],
    membership: ['MEMBER_JOINED', 'MEMBER_REQUESTED'],
    events: ['EVENT_CREATED', 'EVENT_SIGNUP'],
    posts: ['POST_PUBLISHED'],
} as const satisfies Record<string, readonly ActivityKind[]>;

export const ACTIVITY_FILTERS = ['all', 'users', 'groups', 'membership', 'events', 'posts'] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const ACTIVITY_PAGE_SIZE = 50;
