/**
 * Display name for a stored city value (e.g. `Jurmala` -> `Jūrmala`).
 * The stored value is the city's `slug` (ASCII); the names come from the `City` table through the `cities` messages.
 * Pass the translator for the `cities` namespace. Unknown values (legacy or
 * free-text) are shown as stored.
 */
type CityTranslator = {
    (key: string): string;
    has(key: string): boolean;
};

export function cityLabel(t: CityTranslator, city: string | null | undefined): string {
    if (!city) return '';
    return t.has(city) ? t(city) : city;
}
