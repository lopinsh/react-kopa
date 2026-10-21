import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI, type RoleToneKey } from '@/lib/constants';

type Props = {
    /** `tag` is the site-colour tint (Going, Owner, Mod); `outline` a ringed tag (Pending, Full); `muted` a quiet fact (Members only). */
    tone?: 'tag' | 'outline' | 'muted' | 'role';
    /** With `tone="role"`: a solid pill in the look's colour for that role (Owner, Mod, Member, Pending). */
    role?: RoleToneKey;
    children: ReactNode;
    className?: string;
};

const TONES = {
    tag: 'frame bg-primary/15 text-foreground',
    outline: 'line bg-transparent text-foreground-muted [--line-color:var(--line-active,var(--foreground-muted))]',
    muted: 'frame bg-tint text-foreground-muted',
    role: '',
} as const;

const ROLES: Record<RoleToneKey, string> = {
    owner: 'bg-role-owner text-role-owner-ink',
    mod: 'bg-role-mod text-role-mod-ink',
    member: 'bg-role-member text-role-member-ink',
    pending: 'bg-role-pending text-role-pending-ink',
};

/** Small tag on cards and rows (AR-09): sentence case, never clickable, never in a category colour. */
export default function Badge({ tone = 'tag', role, children, className }: Props) {
    return (
        <span
            data-ui={UI.badge}
            className={clsx(
                'inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill px-2 text-tag [&_svg]:h-[11px] [&_svg]:w-[11px] [&_svg]:stroke-[2.8]',
                TONES[tone],
                tone === 'role' && role && ROLES[role],
                className
            )}
        >
            {children}
        </span>
    );
}
