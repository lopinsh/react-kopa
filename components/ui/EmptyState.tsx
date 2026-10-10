import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    icon: ReactNode;
    title: string;
    description?: string;
    /** Optional call to action (a Button or link). */
    action?: ReactNode;
    className?: string;
};

/** Dashed box shown where a list would be when it has nothing in it. Says what is missing and, if possible, what to do next. */
export default function EmptyState({ icon, title, description, action, className }: Props) {
    return (
        <div
            data-ui={UI.emptyState}
            className={clsx('flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-surface px-6 py-24 text-center', className)}
        >
            <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted opacity-40">
                {icon}
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-foreground">{title}</h2>
            {description && <p className="mx-auto mt-3 max-w-sm text-lg text-foreground-muted">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
