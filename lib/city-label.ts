/**
 * Display name for a stored city value (e.g. `Jurmala` -> `Jūrmala`).
 * Stored values in `CITIES` stay ASCII; only the label is localized.
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
