import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { HandbookHeading } from '@/lib/services/handbook.service';

interface Props {
    headings: HandbookHeading[];
    children: ReactNode;
    /** The UI-elements page needs more than a reading column. */
    wide?: boolean;
}

/** One reading column plus the chapter's own headings ("On this page", sticky from `lg`). The chapter list lives in the admin frame's pages list (AR-68). */
export default async function HandbookShell({ headings, children, wide = false }: Props) {
    const t = await getTranslations('admin.handbook');
    const toc = !wide && headings.length > 0;
    return (
        <div className={toc ? 'xl:grid xl:grid-cols-[minmax(0,70ch)_14rem] xl:gap-10' : undefined}>
            <article className={wide ? 'min-w-0' : 'min-w-0 max-w-[70ch]'}>
                {children}
                {!wide && <p className="mt-12 border-t border-border pt-4 text-meta text-foreground-muted">{t('note')}</p>}
            </article>
            {toc && (
                <nav aria-label={t('onThisPage')} className="sticky top-14 mt-6 self-start xl:mt-0">
                    <p className="px-2.5 pb-1 text-tag text-foreground-muted">{t('onThisPage')}</p>
                    <ul className="space-y-0.5 border-l border-border pl-2">
                        {headings.map((h) => (
                            <li key={h.id}>
                                <a href={`#${h.id}`} className="block rounded-lg px-2.5 py-1 text-body-sm text-foreground-muted hover:text-foreground">{h.text}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    );
}
