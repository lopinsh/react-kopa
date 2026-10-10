import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { ChapterSlug, HandbookChapterLink, HandbookHeading } from '@/lib/services/handbook.service';

interface Props {
    chapters: HandbookChapterLink[];
    /** The open chapter, or null on the index page. */
    current: ChapterSlug | null;
    headings: HandbookHeading[];
    children: ReactNode;
    /** Set on the UI-elements page, which is not a chapter. */
    active?: 'ui-elements';
    /** The UI-elements page needs more than a reading column. */
    wide?: boolean;
}

const itemClass = 'block rounded-lg px-3 py-1.5 text-sm transition-colors';

async function ChapterList({ chapters, current, headings, active }: Pick<Props, 'chapters' | 'current' | 'headings' | 'active'>) {
    const t = await getTranslations('admin.handbook');
    return (
        <ul className="space-y-0.5">
            <li>
                <Link
                    href="/admin/handbook"
                    aria-current={current === null ? 'page' : undefined}
                    className={`${itemClass} font-semibold ${current === null ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    {t('overview')}
                </Link>
            </li>
            {chapters.map((chapter) => (
                <li key={chapter.slug}>
                    <Link
                        href={`/admin/handbook/${chapter.slug}`}
                        aria-current={chapter.slug === current ? 'page' : undefined}
                        className={`${itemClass} font-semibold ${chapter.slug === current ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                    >
                        {chapter.title}
                    </Link>
                    {chapter.slug === current && headings.length > 0 && (
                        <ul aria-label={t('onThisPage')} className="my-1 ml-3 space-y-0.5 border-l border-border pl-2">
                            {headings.map((heading) => (
                                <li key={heading.id}>
                                    <a href={`#${heading.id}`} className={`${itemClass} py-1 text-foreground-muted hover:text-foreground`}>
                                        {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
            <li>
                <Link
                    href="/admin/handbook/ui-elements"
                    aria-current={active === 'ui-elements' ? 'page' : undefined}
                    className={`${itemClass} font-semibold ${active === 'ui-elements' ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:text-foreground'}`}
                >
                    {t('uiElements')}
                </Link>
            </li>
        </ul>
    );
}

/** Wiki frame: chapter list (sticky sidebar on desktop, collapsible menu on phones) and one reading column. */
export default async function HandbookShell({ chapters, current, headings, children, active, wide = false }: Props) {
    const t = await getTranslations('admin.handbook');
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <details className="group mb-6 rounded-xl border border-border bg-surface lg:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-foreground">
                        {t('chapters')}
                        <ChevronDown className="h-4 w-4 text-foreground-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <nav aria-label={t('chapters')} className="border-t border-border p-2">
                        <ChapterList chapters={chapters} current={current} headings={headings} active={active} />
                    </nav>
                </details>
                <nav aria-label={t('chapters')} className="sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto lg:block">
                    <ChapterList chapters={chapters} current={current} headings={headings} active={active} />
                </nav>
                <article className={wide ? 'min-w-0' : 'min-w-0 max-w-[70ch]'}>
                    {children}
                    {!wide && <p className="mt-12 border-t border-border pt-4 text-xs text-foreground-muted">{t('note')}</p>}
                </article>
            </div>
        </div>
    );
}
