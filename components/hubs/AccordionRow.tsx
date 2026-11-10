'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';

type Props = {
    icon: ReactNode;
    title: string;
    lang?: string;
    /** A quiet second line when closed (the group under an event). */
    sub?: string;
    when: string;
    /** The text shown once the row is open. */
    body?: string | null;
    /** Meta line when open: what it is and where from. */
    meta: ReactNode;
    action: { href: string; label: string };
    /** Three lines of body (events) instead of the feed's two. */
    clamp?: 2 | 3;
};

/** A one-line row that a tap opens (K-79, K-100): icon, text, when; open shows the text once, its meta and a link on. Body text is never bold (K-109). */
export default function AccordionRow({ icon, title, lang, sub, when, body, meta, action, clamp = 2 }: Props) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <div className="border-0 border-t border-dashed border-border first:border-t-0">
            <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="flex min-h-11 w-full items-center gap-2 py-2 text-left">
                <span className="grid size-6 shrink-0 place-items-center rounded-item bg-tint text-foreground-muted [&>svg]:size-3.5" aria-hidden="true">{icon}</span>
                <span className="min-w-0 flex-1">
                    <span lang={lang} className={clsx('block text-body-sm text-foreground', open ? 'break-words' : 'truncate')}>{title}</span>
                    {sub && <span className="block truncate text-meta text-foreground-muted">{sub}</span>}
                </span>
                <span className="shrink-0 text-meta text-foreground-muted">{when}</span>
                <ChevronDown aria-hidden="true" className={clsx('size-4 shrink-0 text-foreground-muted', open && 'rotate-180')} />
            </button>
            <div id={id} hidden={!open} className="pb-3 pl-8">
                {body && <p lang={lang} className={clsx('text-body-sm text-foreground', clamp === 3 ? 'line-clamp-3' : 'line-clamp-2')}>{body}</p>}
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-meta text-foreground-muted">
                    {meta}
                    <span aria-hidden="true">·</span>
                    <Link href={action.href} className="underline underline-offset-2 hover:text-foreground">{action.label}</Link>
                </p>
            </div>
        </div>
    );
}
