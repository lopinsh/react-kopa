import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
    title: ReactNode;
    /** One quiet line under the title. */
    lead?: ReactNode;
    /** Buttons at the right (wrap under the title on a phone). */
    actions?: ReactNode;
    /** Names the page on a phone only; on desktop the page is already named by the marked menu item. */
    phoneOnly?: boolean;
    lang?: string;
    className?: string;
};

/** The title block of a page: the page title (text-title), an optional lead line, an optional actions slot. */
export default function PageHead({ title, lead, actions, phoneOnly, lang, className }: Props) {
    return (
        <header className={clsx('flex flex-wrap items-start justify-between gap-4', phoneOnly && 'md:sr-only', className)}>
            <div className="min-w-0">
                <h1 lang={lang} className="text-title text-foreground [overflow-wrap:anywhere]">{title}</h1>
                {lead && <p className="mt-1 max-w-[70ch] text-body text-foreground-muted">{lead}</p>}
            </div>
            {actions}
        </header>
    );
}
