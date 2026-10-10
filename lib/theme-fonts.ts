import {
    Geist, Literata, Commissioner, Atkinson_Hyperlegible, Alegreya_Sans, Source_Serif_4, Lora, Nunito_Sans,
} from 'next/font/google';

/**
 * Every font an admin can pick (THEME_FONTS in lib/constants/theme.ts), each exposing a CSS variable.
 * next/font needs literal options, so they are repeated. Only Geist (today's look) is preloaded; the others are
 * fetched by the browser when a page actually uses them (unicode-range), so unused fonts cost nothing.
 */
const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin', 'latin-ext'], display: 'swap' });
const literata = Literata({ variable: '--font-literata', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
const commissioner = Commissioner({ variable: '--font-commissioner', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
const atkinson = Atkinson_Hyperlegible({ variable: '--font-atkinson', subsets: ['latin', 'latin-ext'], weight: ['400', '700'], display: 'swap', preload: false });
const alegreya = Alegreya_Sans({ variable: '--font-alegreya-sans', subsets: ['latin', 'latin-ext'], weight: ['400', '500', '700', '800'], display: 'swap', preload: false });
const sourceSerif = Source_Serif_4({ variable: '--font-source-serif', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
const lora = Lora({ variable: '--font-lora', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });
const nunito = Nunito_Sans({ variable: '--font-nunito-sans', subsets: ['latin', 'latin-ext'], display: 'swap', preload: false });

/** Class names that define all the font variables; put them on `<html>`. */
export const THEME_FONT_CLASSES = [geist, literata, commissioner, atkinson, alegreya, sourceSerif, lora, nunito]
    .map((f) => f.variable)
    .join(' ');
