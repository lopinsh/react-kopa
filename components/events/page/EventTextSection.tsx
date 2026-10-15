import { Lock } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import { sanitizeRichText } from '@/lib/sanitize';
import { langAttr, type TextLang } from '@/lib/translations';

/**
 * A text section of the event page ("Par pasākumu", "Praktiskā informācija"): one component for both, so they cannot drift (cmv9b6daz).
 * Same heading, same body, no accent colour, tint, border or icon in the heading. `lock` adds the quiet line under the heading: `members`
 * for practical info only participants see (text follows), `locked` when this viewer may not read it yet (the sentence replaces the text,
 * and no text is passed).
 */
export default async function EventTextSection({ heading, html, lang, titleLang, lock }: {
    heading: string;
    html: string | null;
    lang: TextLang;
    titleLang: TextLang;
    lock?: { kind: 'members' | 'locked'; text: string };
}) {
    const locale = await getLocale();
    const label = langAttr(lang, locale);
    return (
        <section className="grid gap-2">
            <h2 className="flex flex-wrap items-center gap-2 font-heading text-[17px] font-semibold leading-snug text-foreground">
                {heading}
                {html && label && lang !== titleLang && <FallbackLangLabel lang={label} />}
            </h2>
            {lock && (
                <p className="flex items-start gap-1.5 text-[13px] text-foreground-muted">
                    <Lock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                    <span>{lock.text}</span>
                </p>
            )}
            {html && lock?.kind !== 'locked' && <div lang={label} className="rich-text text-[15px]" dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />}
        </section>
    );
}
