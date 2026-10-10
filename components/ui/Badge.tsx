import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    /** `muted` is the quiet grey pill; `accent` uses the group's category colour (`--accent`). */
    tone?: 'muted' | 'accent';
    /** Colour for the `accent` tone when `--accent` isn't set on an ancestor (e.g. on discovery cards). */
    color?: string;
    children: ReactNode;
    className?: string;
};

/** Small uppercase pill on cards and rows: "Members only", "Full", "Request". */
export default function Badge({ tone = 'muted', color, children, className }: Props) {
    return (
        <span
            data-ui={UI.badge}
            style={color ? ({ '--accent': color } as CSSProperties) : undefined}
            className={clsx(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide',
                tone === 'accent' ? 'bg-[var(--accent)] text-white' : 'bg-surface-elevated text-foreground-muted',
                className
            )}
        >
            {children}
        </span>
    );
}
