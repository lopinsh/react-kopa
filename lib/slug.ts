const latvianMap: Record<string, string> = {
    'ā': 'a', 'Ā': 'A',
    'č': 'c', 'Č': 'C',
    'ē': 'e', 'Ē': 'E',
    'ģ': 'g', 'Ģ': 'G',
    'ī': 'i', 'Ī': 'I',
    'ķ': 'k', 'Ķ': 'K',
    'ļ': 'l', 'Ļ': 'L',
    'ņ': 'n', 'Ņ': 'N',
    'š': 's', 'Š': 'S',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z'
};

/**
 * Centralized slugification utility with diacritics support (transliteration).
 * Specifically handles Latvian characters by normalizing them to their base Latin forms.
 */
export function slugify(text: string): string {
    if (!text) return '';

    // Step 1: Transliterate Latvian specific characters
    let transliterated = text.toString();
    for (const [key, value] of Object.entries(latvianMap)) {
        // Use global replacement for each character
        transliterated = transliterated.replace(new RegExp(key, 'g'), value);
    }

    return transliterated
        .normalize('NFD')                   // Split accented characters (e.g., ā -> a + diacritic)
        .replace(/[\u0300-\u036f]/g, '')     // Remove diacritical marks
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')                // Replace spaces with -
        .replace(/[^\w-]+/g, '')             // Remove characters that are not letters, numbers, or dashes
        .replace(/--+/g, '-')                // Replace multiple dashes with a single dash
        .replace(/^-+|-+$/g, '');            // Trim dashes from the start and end
}
