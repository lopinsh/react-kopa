/**
 * Turns a display name into a username suggestion:
 * "Oskars Feldmanis" -> "oskars_feldmanis", "Līga Kalniņa" -> "liga_kalnina".
 * The result may still be too short or taken; callers validate it.
 */

const CYRILLIC: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
};

export const USERNAME_MAX_LENGTH = 30;

export function usernameFromName(name: string): string {
    const latin = name
        .toLowerCase()
        .replace(/[а-яё]/g, (ch) => CYRILLIC[ch] ?? '')
        // Split letters from their diacritics (ā -> a + ¯, ķ -> k + ¸) and drop the marks.
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

    return latin
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+/, '')
        .slice(0, USERNAME_MAX_LENGTH)
        .replace(/_+$/, '');
}
