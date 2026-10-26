import { TYPE_EMPHASIS, TYPE_MUTED_CLASS, type TypeEmphasis } from '@/lib/constants';

export interface TextExplanation {
    /** The role's own weight in this place; null when it could not be read. */
    base: number | null;
    weight: number;
    emphasis: TypeEmphasis | null;
    muted: boolean;
    state: 'current' | 'pressed' | null;
}

/** Computed font weight of a throwaway hidden span with only the role utility, placed beside the role element so it inherits the same variables. */
function roleWeight(roleEl: Element, utility: string): number | null {
    const parent = roleEl.parentElement;
    if (!(parent instanceof HTMLElement)) return null;
    const probe = document.createElement('span');
    probe.hidden = true;
    probe.className = utility;
    try {
        parent.appendChild(probe);
        return Number(getComputedStyle(probe).fontWeight);
    } catch {
        return null;
    } finally {
        probe.remove();
    }
}

/** Why a clicked text looks as it does (read-only: the probe is added and removed in the same call). */
export function explainText(target: Element, roleEl: Element, utility: string): TextExplanation {
    let emphasis: TypeEmphasis | null = null;
    for (let cur: Element | null = target; cur && !emphasis; cur = cur === roleEl ? null : cur.parentElement) {
        emphasis = TYPE_EMPHASIS.find((e) => cur?.classList.contains(e.cls))?.key ?? null;
    }
    let muted = false;
    for (let cur: Element | null = target; cur && cur !== document.body; cur = cur.parentElement) {
        const own = cur.classList.contains(TYPE_MUTED_CLASS);
        if (own || cur.classList.contains('text-foreground')) { muted = own; break; }
    }
    const state = target.closest('[aria-current]:not([aria-current="false"]), [aria-selected="true"]') ? 'current' : target.closest('[aria-pressed="true"]') ? 'pressed' : null;
    const weight = Number(getComputedStyle(target).fontWeight);
    return { base: roleWeight(roleEl, utility) ?? (emphasis ? null : weight), weight, emphasis, muted, state };
}
