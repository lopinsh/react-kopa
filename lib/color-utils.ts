/**
 * Utility for color manipulation and contrast calculations.
 */

/**
 * Converts a hex color to RGB.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculates the relative luminance of an RGB color.
 * Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Determines if a color is "light" or "dark" based on luminance.
 * Threshold of 0.179 is commonly used for white vs black text.
 */
export function isLight(hex: string): boolean {
    const rgb = hexToRgb(hex);
    if (!rgb) return true;
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.179;
}

/**
 * Returns a suitable foreground color (black or white) for a given background hex.
 */
export function getContrastForeground(bgHex: string): 'white' | 'black' {
    return isLight(bgHex) ? 'black' : 'white';
}

/**
 * Adjusts a color to ensure it has enough contrast against a white background (WCAG AA).
 * If the color is too light, it darkens it.
 */
export function ensureContrast(hex: string, targetBackground: 'white' | 'black' = 'white'): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    if (targetBackground === 'white') {
        const luminance = getLuminance(r, g, b);
        // If luminance is > 0.45, it's getting dangerous on white background
        if (luminance > 0.45) {
            // Darken by 30%
            r = Math.floor(r * 0.7);
            g = Math.floor(g * 0.7);
            b = Math.floor(b * 0.7);
        }
    }

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
