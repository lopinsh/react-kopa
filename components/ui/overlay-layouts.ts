import { clsx } from 'clsx';

export type OverlayLayout = 'dialog' | 'sheet' | 'right' | 'left' | 'panel' | 'screen';
export type OverlaySize = 'sm' | 'md' | 'lg' | '2xl' | '4xl';

const SIZE = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', '2xl': 'sm:max-w-2xl', '4xl': 'sm:max-w-4xl' } as const;
const SHEET = 'w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl frame bg-surface shadow-dialog motion-safe:animate-rise';
const PANEL_PAD = 'p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4';
// The opened card and the event panel (AR-44, AR-55, R6b): a sheet below md, from md a centred overlay that is as tall as its content.
const PANEL = 'w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl frame bg-surface shadow-dialog motion-safe:animate-rise md:max-h-[min(calc(100dvh-3rem),800px)] md:max-w-focus md:rounded-2xl motion-safe:md:animate-pop';

/** The panel's classes for a layout (the wrapper's alignment stays in Overlay). */
export function panelClasses(layout: OverlayLayout, size: OverlaySize, flush: boolean) {
    switch (layout) {
        case 'dialog': return clsx(SHEET, 'sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl motion-safe:sm:animate-pop', SIZE[size], !flush && PANEL_PAD);
        case 'sheet': return clsx(SHEET, 'sm:max-w-focus', !flush && PANEL_PAD);
        case 'panel': return clsx(PANEL, !flush && 'p-4');
        case 'right': return clsx('flex h-full w-full flex-col overflow-y-auto bg-surface shadow-premium sm:max-w-md sm:border-l-[length:var(--line-width)] sm:border-l-[color:var(--line-color)] motion-safe:animate-from-right', !flush && 'p-4');
        // The phone search (OD-20): the whole screen, no handle, corners or shadow; the scrim is covered.
        case 'screen': return 'flex h-dvh w-full flex-col overflow-hidden bg-surface motion-safe:animate-fade';
        case 'left': return clsx('flex h-full w-4/5 max-w-xs flex-col overflow-y-auto bg-surface shadow-premium border-r-[length:var(--frame-width)] border-r-[color:var(--line-color)] motion-safe:animate-from-left', !flush && 'p-4');
    }
}
