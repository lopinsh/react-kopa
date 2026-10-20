import type { ReactNode } from 'react';
import { PANEL_TITLE_ID } from '@/lib/constants';

/** The panel's text column: 14/18 px padding, 9 px between its parts, room for the phone's home bar. */
export default function PanelBody({ children }: { children: ReactNode }) {
    return <div className="grid gap-2.5 px-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] pt-3.5 md:pb-[18px]">{children}</div>;
}

/** The panel's name: the dialog's label, and where focus goes when the content changes. */
export function PanelTitle({ children, lang }: { children: ReactNode; lang?: string }) {
    return <h2 id={PANEL_TITLE_ID} tabIndex={-1} lang={lang} className="text-section text-foreground outline-none">{children}</h2>;
}

/** A panel's quiet text link ("Atvērt grupas lapu", "Visa informācija"): the same look as TextLink, for a plain `<a>`. */
export const PANEL_LINK = 'text-button-sm text-primary underline decoration-border underline-offset-4 hover:decoration-primary';
