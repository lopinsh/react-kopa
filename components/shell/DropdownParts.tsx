import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/routing';

/** The panel's head: its name (which labels the panel) and, at the right, one quiet action. */
export function DropdownHead({ id, title, action }: { id: string; title: string; action?: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 id={id} className="font-heading text-[15px] font-semibold text-foreground">{title}</h2>
            {action}
        </div>
    );
}

/** The panel's last line: the link to the whole list. */
export function DropdownFooter({ href, label }: { href: ComponentProps<typeof Link>['href']; label: string }) {
    return (
        <Link href={href} className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
            {label}
        </Link>
    );
}
