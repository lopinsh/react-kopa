import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

/** A neutral block that stands where content will arrive; it pulses only for people who allow motion. */
export function SkeletonBlock({ className }: { className?: string }) {
    return <span aria-hidden="true" className={clsx('block rounded-lg bg-tint motion-safe:animate-pulse', className)} />;
}

/** Today's discovery card: image area, title, two text lines. */
export function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            <SkeletonBlock className="aspect-[16/10] rounded-none" />
            <div className="grid gap-2 p-4">
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="h-3.5 w-full" />
                <SkeletonBlock className="h-3.5 w-2/3" />
            </div>
        </div>
    );
}

/** A 40 px circle and two lines: member, event and conversation rows. */
export function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 py-2">
            <SkeletonBlock className="size-10 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
                <SkeletonBlock className="h-4 w-1/2" />
                <SkeletonBlock className="h-3.5 w-3/4" />
            </div>
        </div>
    );
}

/** A box: a heading line and three lines. */
export function SkeletonPanel() {
    return (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
            <SkeletonBlock className="h-5 w-1/3" />
            <SkeletonBlock className="h-3.5 w-full" />
            <SkeletonBlock className="h-3.5 w-full" />
            <SkeletonBlock className="h-3.5 w-2/3" />
        </div>
    );
}

/** Wraps a loading shape: announced once as busy, the blocks stay silent. */
export function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div role="status" aria-busy="true" data-ui={UI.skeleton}>
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}
