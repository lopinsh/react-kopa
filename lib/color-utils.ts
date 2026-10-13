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

/** A see-through version of any CSS colour (hex or `var(--x)`): `percent` of the colour, the rest transparent. */
export function tint(color: string, percent: number): string {
    return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
