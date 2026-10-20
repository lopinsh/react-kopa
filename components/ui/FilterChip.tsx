import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
};

/** Round toggle chip for narrowing a list (e.g. All / Personal / Groups in the inbox). */
export default function FilterChip({ active, onClick, children }: Props) {
    return (
        <button
            type="button"
            data-ui={UI.filterChip}
            onClick={onClick}
            aria-pressed={active}
            className={clsx(
                'inline-flex h-8 shrink-0 items-center gap-[5px] whitespace-nowrap rounded-pill line press px-2.5 text-meta',
                active ? 'bg-primary/15 weight-strong text-foreground [--line-color:var(--line-active,color-mix(in_srgb,var(--primary)_45%,transparent))]' : 'bg-surface text-foreground hover:bg-tint'
            )}
        >
            {children}
        </button>
    );
}
