import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Item = { key: string; label: string; href: string; /** Language code when the label is not in the page language. */ lang?: string; count?: number };

type Props = {
    /** The page's name: on phones it stands over the tabs; from `md` the pages column already names it. */
    title: string;
    /** Accessible name of the tab row. */
    label: string;
    items: Item[];
    active: string;
    /** The page's one action, at the right end of the tab row. */
    action?: ReactNode;
};

/** The parts of a group page as tabs (AR-21): each tab is its own URL, the open one is underlined in the site colour. */
export default function GroupPartTabs({ title, label, items, active, action }: Props) {
    return (
        <div>
            <h2 className="font-heading text-xl font-semibold md:sr-only">{title}</h2>
            {items.length > 0 && (
                <div data-ui={UI.tabs} className="mt-2 flex items-end gap-3 border-b border-border md:mt-0">
                    <nav aria-label={label} className="flex min-w-0 flex-1 gap-[18px] overflow-x-auto [scrollbar-width:none]">
                        {items.map(({ key, label: text, href, lang, count }) => (
                            <Link
                                key={key}
                                href={href}
                                scroll={false}
                                lang={lang}
                                aria-current={key === active ? 'page' : undefined}
                                className={clsx(
                                    '-mb-px whitespace-nowrap border-b-2 pb-2 pt-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                                    key === active ? 'border-primary font-semibold text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'
                                )}
                            >
                                {text}
                                {count !== undefined && count > 0 && <span className="ml-1 tabular-nums">{count}</span>}
                            </Link>
                        ))}
                    </nav>
                    {action && <div className="mb-1.5 shrink-0">{action}</div>}
                </div>
            )}
        </div>
    );
}
