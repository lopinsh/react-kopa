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
                'inline-flex h-8 shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset transition-colors',
                active ? 'bg-primary/15 font-semibold text-foreground ring-primary/45' : 'bg-surface text-foreground ring-border hover:bg-tint'
            )}
        >
            {children}
        </button>
    );
}
