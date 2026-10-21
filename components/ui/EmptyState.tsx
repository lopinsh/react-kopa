import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    icon: LucideIcon;
    title: string;
    /** One sentence, in the site's own voice. */
    description?: string;
    /** At most one: a Button or link. */
    action?: ReactNode;
    headingLevel?: 'h2' | 'h3';
    className?: string;
};

/** Where a list would be when it has nothing in it (AR-66): outline icon, a short title, one italic sentence, at most one action. */
export default function EmptyState({ icon: Icon, title, description, action, headingLevel: Heading = 'h2', className }: Props) {
    return (
        <div data-ui={UI.emptyState} className={clsx('grid justify-items-center gap-1.5 px-4 pb-7 pt-6 text-center', className)}>
            <Icon aria-hidden="true" strokeWidth={1.6} className="size-7 text-foreground-muted" />
            <Heading className="text-item text-foreground">{title}</Heading>
            {description && <p className="max-w-xs text-meta italic text-primary">{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
