import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from '@/i18n/routing';
import { headingId, isChapterSlug } from '@/lib/services/handbook.service';

/** Text of a heading's children, for building its anchor id. */
function textOf(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(textOf).join('');
    if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children);
    return '';
}

/**
 * Chapter files link to each other as `values.md`, which works on GitHub.
 * On the site that becomes `/admin/handbook/values`. Other relative links
 * (e.g. `../execution_handoff.md`) point outside the Handbook and render as plain text.
 */
function resolveHref(href: string | undefined): { kind: 'internal' | 'anchor' | 'external' | 'none'; href: string } {
    if (!href) return { kind: 'none', href: '' };
    if (/^https?:\/\//.test(href)) return { kind: 'external', href };
    if (href.startsWith('#')) return { kind: 'anchor', href };
    const match = /^([A-Za-z]+)\.md(#.*)?$/.exec(href);
    if (match) {
        const [, name, hash = ''] = match;
        if (name === 'README') return { kind: 'internal', href: `/admin/handbook${hash}` };
        if (isChapterSlug(name)) return { kind: 'internal', href: `/admin/handbook/${name}${hash}` };
    }
    return { kind: 'none', href };
}

const linkClass = 'font-medium text-primary underline underline-offset-2 hover:opacity-80';

const components: Components = {
    h1: ({ children }) => <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">{children}</h1>,
    h2: ({ children }) => (
        <h2 id={headingId(textOf(children))} className="mb-4 mt-12 scroll-mt-24 border-b border-border pb-2 text-2xl font-bold tracking-tight text-foreground">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 id={headingId(textOf(children))} className="mb-2 mt-8 scroll-mt-24 text-lg font-semibold text-foreground">
            {children}
        </h3>
    ),
    p: ({ children }) => <p className="my-4 leading-relaxed text-foreground">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 text-foreground marker:text-foreground-muted">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 text-foreground marker:text-foreground-muted">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    del: ({ children }) => <del className="text-foreground-muted">{children}</del>,
    code: ({ children }) => (
        <code className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[0.85em] [overflow-wrap:anywhere]">{children}</code>
    ),
    blockquote: ({ children }) => (
        <blockquote className="my-6 rounded-xl border border-border border-l-4 border-l-primary bg-surface px-4 py-1 text-foreground">{children}</blockquote>
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: ({ children }) => (
        <div className="my-6 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">{children}</table>
        </div>
    ),
    th: ({ children }) => <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground-muted">{children}</th>,
    td: ({ children }) => <td className="min-w-28 border-b border-border/60 px-4 py-2.5 align-top [tr:last-child_&]:border-0">{children}</td>,
    a: ({ href, children }) => {
        const target = resolveHref(href);
        if (target.kind === 'internal') return <Link href={target.href} className={linkClass}>{children}</Link>;
        if (target.kind === 'anchor') return <a href={target.href} className={linkClass}>{children}</a>;
        if (target.kind === 'external') return <a href={target.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{children}</a>;
        return <span>{children}</span>;
    },
};

/** Renders one Handbook markdown file with the site's theme. */
export default function HandbookMarkdown({ markdown }: { markdown: string }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
        </ReactMarkdown>
    );
}
