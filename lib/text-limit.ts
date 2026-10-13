export type LimitState = 'ok' | 'near' | 'over';

/**
 * How full a text field is (AR-71). `near` from the last tenth (1800 of 2000: the drawing's 1874 is near, 2013 is over).
 * Length is what the field holds (`value.length`, the unit Zod's `.max` counts).
 */
export function limitState(length: number, max: number): LimitState {
    if (length > max) return 'over';
    return length >= Math.ceil(max * 0.9) ? 'near' : 'ok';
}

export const isOverLimit = (value: string | null | undefined, max: number): boolean => (value ?? '').length > max;
