import { clsx } from 'clsx';

export type OverlayLayout = 'dialog' | 'sheet' | 'right' | 'left' | 'panel';
export type OverlaySize = 'sm' | 'md' | 'lg' | '2xl' | '4xl';

const SIZE = { sm: 'sm:max-w-sm', md: 'sm:max-w-[420px]', lg: 'sm:max-w-lg', '2xl': 'sm:max-w-2xl', '4xl': 'sm:max-w-4xl' } as const;
const SHEET = 'w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface shadow-dialog motion-safe:animate-rise';
const PANEL_PAD = 'p-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] sm:pb-[18px]';
// The opened card and the event panel (AR-44, AR-55): a sheet below md, from md a full-height panel at the right.
const PANEL = 'w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface shadow-dialog motion-safe:animate-rise md:h-full md:max-h-none md:max-w-[400px] md:rounded-none md:border-l md:border-border md:shadow-premium motion-safe:md:animate-from-right';

/** The panel's classes for a layout (the wrapper's alignment stays in Overlay). */
export function panelClasses(layout: OverlayLayout, size: OverlaySize, flush: boolean) {
    switch (layout) {
        case 'dialog': return clsx(SHEET, 'sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl motion-safe:sm:animate-pop', SIZE[size], !flush && PANEL_PAD);
        case 'sheet': return clsx(SHEET, 'sm:max-w-[560px]', !flush && PANEL_PAD);
        case 'panel': return clsx(PANEL, !flush && 'p-[18px]');
        case 'right': return clsx('flex h-full w-full flex-col overflow-y-auto bg-surface shadow-premium sm:max-w-md sm:border-l sm:border-border motion-safe:animate-from-right', !flush && 'p-[18px]');
        case 'left': return clsx('flex h-full w-4/5 max-w-[320px] flex-col overflow-y-auto bg-surface shadow-premium motion-safe:animate-from-left', !flush && 'p-[18px]');
    }
}
