import type { ReactNode } from 'react';

type Props = { title: string; subtitle?: string; action?: ReactNode };

/** The title block of an admin page (R11b): serif h1, one quiet line, an optional action at the right. */
export default function AdminPageHeader({ title, subtitle, action }: Props) {
    return (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{title}</h1>
                {subtitle && <p className="mt-1 max-w-[70ch] text-foreground-muted">{subtitle}</p>}
            </div>
            {action}
        </header>
    );
}
