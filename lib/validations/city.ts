import { z } from 'zod';

export const CITY_NAME_MIN = 2;
export const CITY_NAME_MAX = 60;

/** A city name as typed: trimmed, inner whitespace collapsed. Letters (also with diacritics), digits, spaces, hyphens, apostrophes and dots. */
export const cityNameSchema = z
    .string()
    .transform((value) => value.replace(/\s+/g, ' ').trim())
    .pipe(
        z
            .string()
            .min(CITY_NAME_MIN, 'CITY_NAME_INVALID')
            .max(CITY_NAME_MAX, 'CITY_NAME_INVALID')
            .regex(/^[\p{L}\p{N}][\p{L}\p{N} .'’-]*$/u, 'CITY_NAME_INVALID')
    );

export const cityNamesSchema = z.object({
    nameLv: cityNameSchema,
    nameEn: cityNameSchema,
});

export type CityNamesInput = z.infer<typeof cityNamesSchema>;
