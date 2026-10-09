/**
 * Owner-written text (group sections, events) is stored once per language. These helpers pick which
 * language a visitor sees: their own if the owner wrote it, else the original, else anything.
 * Owner text is never machine-translated.
 */

export const TEXT_LANGS = ['lv', 'en'] as const;
export type TextLang = (typeof TEXT_LANGS)[number];

export function toTextLang(value: string | null | undefined): TextLang {
    return value === 'en' ? 'en' : 'lv';
}

/** True when a (possibly rich-text) value holds something a person would read. */
export function hasText(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0 || /<img\b/i.test(value);
}

export interface ResolvedText {
    value: string;
    /** Language the shown text is written in. */
    lang: TextLang;
    /** True when `lang` is not the viewer's language (the page shows a label and a `lang` attribute). */
    isFallback: boolean;
}

/**
 * Picks one field from a set of per-language rows: the viewer's row if it has text, else the original
 * language's row, else any row with text. With no text anywhere the value is empty and not a fallback.
 */
export function resolveText<T extends { lang: string }>(
    rows: readonly T[],
    viewerLang: TextLang,
    originalLang: string,
    pick: (row: T) => string | null | undefined
): ResolvedText {
    const candidates = [
        rows.find((r) => r.lang === viewerLang),
        rows.find((r) => r.lang === originalLang),
        ...rows
    ];
    for (const row of candidates) {
        if (!row) continue;
        const value = pick(row);
        if (hasText(value)) {
            return { value: value as string, lang: toTextLang(row.lang), isFallback: row.lang !== viewerLang };
        }
    }
    return { value: '', lang: viewerLang, isFallback: false };
}

/** The language of the first non-empty fallback among the given fields (for the one label per item), if any. */
export function fallbackLang(...fields: ResolvedText[]): TextLang | null {
    return fields.find((f) => f.isFallback && hasText(f.value))?.lang ?? null;
}

function fallbackFields(viewerLang: TextLang, ...fields: ResolvedText[]) {
    const lang = fallbackLang(...fields);
    return { fallbackLang: lang, lang: lang ?? viewerLang, isFallback: lang !== null };
}

export interface TranslatedSectionRow {
    lang: string;
    title: string;
    content: string;
}

export interface ResolvedSectionText {
    title: string;
    /** Language the title is written in. */
    titleLang: TextLang;
    content: string;
    contentLang: TextLang;
    /** Language to name in the "Latviski / In English" label; null when everything is in the viewer's language. */
    fallbackLang: TextLang | null;
    /** `fallbackLang ?? viewer's language` and `fallbackLang !== null`, for callers that want the plain pair. */
    lang: TextLang;
    isFallback: boolean;
}

/**
 * Section text for one viewer. `withholdContent` (members-only section, viewer not a member) skips the
 * content entirely: it is never read from any language row, so it cannot leak through a translation.
 */
export function resolveSectionText(
    rows: readonly TranslatedSectionRow[],
    viewerLang: TextLang,
    originalLang: string,
    withholdContent = false
): ResolvedSectionText {
    const title = resolveText(rows, viewerLang, originalLang, (r) => r.title);
    const content: ResolvedText = withholdContent
        ? { value: '', lang: viewerLang, isFallback: false }
        : resolveText(rows, viewerLang, originalLang, (r) => r.content);
    return {
        title: title.value,
        titleLang: title.lang,
        content: content.value,
        contentLang: content.lang,
        ...fallbackFields(viewerLang, title, content)
    };
}

export interface TranslatedEventRow {
    lang: string;
    title: string;
    description: string | null;
    instructions: string | null;
}

export interface ResolvedEventText {
    title: string;
    titleLang: TextLang;
    description: string | null;
    descriptionLang: TextLang;
    /** Null when there are none or the viewer may not read them (`withholdInstructions`). */
    instructions: string | null;
    instructionsLang: TextLang;
    /** True when the event has instructions in any language, even if this viewer may not read them. */
    hasInstructions: boolean;
    fallbackLang: TextLang | null;
    lang: TextLang;
    isFallback: boolean;
}

/** Event text for one viewer; withheld instructions are never read from any language row. */
export function resolveEventText(
    rows: readonly TranslatedEventRow[],
    viewerLang: TextLang,
    originalLang: string,
    withholdInstructions = false
): ResolvedEventText {
    const title = resolveText(rows, viewerLang, originalLang, (r) => r.title);
    const description = resolveText(rows, viewerLang, originalLang, (r) => r.description);
    const instructions: ResolvedText = withholdInstructions
        ? { value: '', lang: viewerLang, isFallback: false }
        : resolveText(rows, viewerLang, originalLang, (r) => r.instructions);
    return {
        title: title.value,
        titleLang: title.lang,
        description: hasText(description.value) ? description.value : null,
        descriptionLang: description.lang,
        instructions: hasText(instructions.value) ? instructions.value : null,
        instructionsLang: instructions.lang,
        hasInstructions: rows.some((r) => hasText(r.instructions)),
        ...fallbackFields(viewerLang, title, description, instructions)
    };
}

/** Title of an event in its own original language (notifications, admin lists), whatever the viewer speaks. */
export function originalEventTitle(rows: readonly { lang: string; title: string }[], originalLang: string): string {
    return resolveText(rows, toTextLang(originalLang), originalLang, (r) => r.title).value;
}

/** Value for a `lang` attribute: only set when the text is not in the page's language. */
export function langAttr(textLang: TextLang, pageLocale: string): TextLang | undefined {
    return textLang === toTextLang(pageLocale) ? undefined : textLang;
}
