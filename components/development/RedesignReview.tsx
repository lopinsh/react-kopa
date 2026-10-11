'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';

const STORAGE_KEY = 'redesign-reviewed';

type Reviewed = Record<string, string>;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

/** The raw stored text (a string compares by value, so useSyncExternalStore stays stable). Empty when storage is unavailable. */
function getSnapshot(): string {
    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
        return '';
    }
}

function parse(raw: string): Reviewed {
    try {
        const value: unknown = JSON.parse(raw);
        return value && typeof value === 'object' ? (value as Reviewed) : {};
    } catch {
        return {};
    }
}

function save(next: Reviewed) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Storage can be blocked; the badge then comes back on the next visit.
    }
    listeners.forEach((l) => l());
}

type Props = {
    /** Every changed section with the page version that touched it. */
    sections: { id: string; version: string }[];
    children: ReactNode;
};

/**
 * Wraps the redesign page: shows each New/Updated badge until this viewer clicks it (remembered per browser by
 * section id + version, so a later change to the same section shows its badge again).
 */
export default function RedesignReview({ sections, children }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    // null on the server and during hydration: badges stay hidden until the stored state is known.
    const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);

    useEffect(() => {
        if (stored === null || !ref.current) return;
        const reviewed = parse(stored);
        ref.current.querySelectorAll<HTMLElement>('[data-rd-badge]').forEach((badge) => {
            badge.hidden = reviewed[badge.dataset.rdSection ?? ''] === badge.dataset.rdVersion;
        });
        const all = ref.current.querySelector<HTMLElement>('[data-rd-dismiss-all]');
        if (all) all.hidden = sections.every((s) => reviewed[s.id] === s.version);
    }, [stored, sections, children]);

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const badge = target.closest<HTMLElement>('[data-rd-badge]');
        const reviewed = parse(getSnapshot());
        if (badge?.dataset.rdSection && badge.dataset.rdVersion) {
            save({ ...reviewed, [badge.dataset.rdSection]: badge.dataset.rdVersion });
        } else if (target.closest('[data-rd-dismiss-all]')) {
            save({ ...reviewed, ...Object.fromEntries(sections.map((s) => [s.id, s.version])) });
        }
    };

    return <div ref={ref} onClick={onClick}>{children}</div>;
}
