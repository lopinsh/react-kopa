/**
 * Centralized slugification utility with diacritics support (transliteration).
 * Specifically handles Latvian characters by normalizing them to their base Latin forms.
 */
export function slugify(text: string): string {
    if (!text) return '';

    return text
        .toString()
        .normalize('NFD')                   // Split accented characters (e.g., ā -> a + diacritic)
        .replace(/[\u0300-\u036f]/g, '')     // Remove diacritical marks
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')                // Replace spaces with -
        .replace(/[^\w-]+/g, '')             // Remove characters that are not letters, numbers, or dashes
        .replace(/--+/g, '-')                // Replace multiple dashes with a single dash
        .replace(/^-+|-+$/g, '');            // Trim dashes from the start and end
}
