import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    /** `tag` is the site-colour tint (Going, Owner, Mod); `outline` a ringed tag (Pending, Full); `muted` a quiet fact (Members only). */
    tone?: 'tag' | 'outline' | 'muted';
    children: ReactNode;
    className?: string;
};

const TONES = {
    tag: 'bg-primary/15 text-foreground',
    outline: 'bg-transparent text-foreground-muted ring-1 ring-inset ring-foreground-muted',
    muted: 'bg-tint text-foreground-muted',
} as const;

/** Small tag on cards and rows (AR-09): sentence case, never clickable, never in a category colour. */
export default function Badge({ tone = 'tag', children, className }: Props) {
    return (
        <span
            data-ui={UI.badge}
            className={clsx(
                'inline-flex h-5 shrink-0 items-center gap-[3px] whitespace-nowrap rounded-full px-2 text-[11px] font-semibold leading-none [&_svg]:h-[11px] [&_svg]:w-[11px] [&_svg]:stroke-[2.8]',
                TONES[tone],
                className
            )}
        >
            {children}
        </span>
    );
}
