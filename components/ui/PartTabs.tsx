'use client';

import type { MouseEvent, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Item = { key: string; label: string; href: string; /** Language code when the label is not in the page language. */ lang?: string; count?: number };

type Props = {
    /** The page's name: on phones it stands over the tabs; from `md` the pages column already names it. Without it the tabs stand alone (a menu of sections on one page). */
    title?: string;
    /** Accessible name of the tab row. */
    label: string;
    items: Item[];
    active: string;
    /** The page's one action, at the right end of the tab row. */
    action?: ReactNode;
    /** The parts are on the page already: a click shows one without loading (the address follows with `?part=`). */
    onSelect?: (key: string) => void;
};

/** The parts of a page as tabs (AR-21): each tab is its own URL (or, with `onSelect`, a part already on the page); the open one is underlined in the site colour. */
export default function PartTabs({ title, label, items, active, action, onSelect }: Props) {
    const Tag = onSelect ? 'a' : Link;
    return (
        // `contents`: the tab row sticks within the page, not within this wrapper.
        <div className="contents">
            {title && <h2 className="text-section md:sr-only">{title}</h2>}
            {items.length > 0 && (
                <div data-ui={UI.tabs} className={clsx('sticky top-0 z-10 flex items-end gap-3 border-b border-border bg-background', title && 'mt-2 md:mt-0')}>
                    <nav aria-label={label} className="flex min-w-0 flex-1 gap-4 overflow-x-auto [scrollbar-width:none]">
                        {items.map(({ key, label: text, href, lang, count }) => (
                            <Tag
                                key={key}
                                href={href}
                                {...(onSelect ? { onClick: (e: MouseEvent<HTMLAnchorElement>) => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); onSelect(key); } } } : { scroll: false })}
                                lang={lang}
                                aria-current={key === active ? 'page' : undefined}
                                className={clsx(
                                    '-mb-px whitespace-nowrap border-b-2 pb-2 pt-1 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                                    key === active ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'
                                )}
                            >
                                {text}
                                {count !== undefined && count > 0 && <span className="ml-1 tabular-nums">{count}</span>}
                            </Tag>
                        ))}
                    </nav>
                    {action && <div className="mb-1.5 shrink-0">{action}</div>}
                </div>
            )}
        </div>
    );
}
