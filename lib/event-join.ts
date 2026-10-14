import type { EventJoinView } from '@/lib/services/event-panel';

/** What the join box shows the viewer next (the same table on the event page and in the panel). */
export type JoinStep =
    | { kind: 'act'; action: 'go' | 'request' | 'waitlist'; note: 'requestNote' | 'fullNote' | null }
    | {
        kind: 'done';
        label: 'going' | 'approved' | 'pending' | 'waitlisted';
        undo: 'cancelGoing' | 'leaveEvent' | 'withdrawRequest' | 'leaveWaitlist';
        /** Giving the place up may not be undoable: ask first (OD-06). */
        confirm: boolean;
        note: 'waitlistNote' | null;
    }
    | { kind: 'quiet'; note: 'declined' | 'tookPlace' }
    /** The organiser of an approval event: no step (they decide others' requests). */
    | { kind: 'none' };

export function joinStepOf(j: EventJoinView): JoinStep {
    if (j.ended) return { kind: 'quiet', note: 'tookPlace' };
    if (j.mode === 'OPEN') {
        return j.myStatus === 'GOING'
            ? { kind: 'done', label: 'going', undo: 'cancelGoing', confirm: false, note: null }
            : { kind: 'act', action: 'go', note: null };
    }
    if (j.canManage) return { kind: 'none' };
    switch (j.myStatus) {
        case 'GOING': return { kind: 'done', label: 'approved', undo: 'leaveEvent', confirm: true, note: null };
        case 'PENDING': return { kind: 'done', label: 'pending', undo: 'withdrawRequest', confirm: false, note: null };
        case 'DECLINED': return { kind: 'quiet', note: 'declined' };
        case 'WAITLISTED':
            if (j.isFull) return { kind: 'done', label: 'waitlisted', undo: 'leaveWaitlist', confirm: true, note: 'waitlistNote' };
            break;
    }
    return j.isFull
        ? { kind: 'act', action: 'waitlist', note: 'fullNote' }
        : { kind: 'act', action: 'request', note: 'requestNote' };
}

/** The row's quiet word after the city (AR-56): "Pieteikšanās" for an approval event, "Pilns" when full; nothing for an open event. */
export function rowWordOf(joinState: 'open' | 'request' | 'full'): 'request' | 'full' | null {
    return joinState === 'open' ? null : joinState;
}
