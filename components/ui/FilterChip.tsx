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
                'shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-colors',
                active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-foreground-muted hover:text-foreground'
            )}
        >
            {children}
        </button>
    );
}
