'use client';

import { useUnreadMessages } from '@/components/providers/UnreadMessagesProvider';

/** Count bubble on the bottom bar's Ziņas cell (the cell's own name carries the count); renders nothing when everything is read. */
export default function UnreadBadge() {
    return <CountBadge count={useUnreadMessages()} />;
}

/** The bubble itself, for any bottom-bar cell with a count. */
export function CountBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span
            aria-hidden="true"
            className="absolute -top-1 left-[calc(50%+6px)] flex h-4 min-w-4 items-center justify-center rounded-pill bg-primary px-1 text-tag text-primary-foreground"
        >
            {count > 9 ? '9+' : count}
        </span>
    );
}
