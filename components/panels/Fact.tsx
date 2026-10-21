import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** One fact line of a panel: a 16 px icon and muted 14 px text. */
export default function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
    return (
        <p className="flex items-start gap-2 text-body-sm text-foreground-muted">
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">{children}</span>
        </p>
    );
}
