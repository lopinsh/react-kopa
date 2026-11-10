import type { ReactNode } from 'react';
import TextLink from '@/components/ui/TextLink';

/** A Pārskats block (K-91): its heading with the count, its own link to its page, then the content. */
export default function HubSection({ id, title, count, link, children }: { id: string; title: string; count?: number; link?: { href: string; label: string }; children: ReactNode }) {
    return (
        <section aria-labelledby={id} className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 id={id} className="text-section text-foreground">
                    {title}
                    {count !== undefined && <span className="ml-2 text-meta weight-medium tabular-nums text-foreground-muted">{count}</span>}
                </h2>
                {link && <TextLink href={link.href} className="shrink-0">{link.label}</TextLink>}
            </div>
            {children}
        </section>
    );
}
