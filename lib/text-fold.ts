/** Lower-case text without diacritics, so a list search for "je" finds "Jēkabpils". */
export function foldText(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
