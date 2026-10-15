import { PANEL_DIALOG_ID, PANEL_VT_NAME, PANEL_VT_WAIT_MS } from '@/lib/constants';

/**
 * The origin of an opened panel (R6b): the card or row that was clicked. A panel opened from one grows out of it and closes back into it
 * (View Transitions API, driven by hand). The one transition name lives only here, is set at click time on exactly one element and is
 * cleared in a `finally` on every path; nothing on the page carries it at rest. Client only.
 */
interface Origin { key: string; card: HTMLElement; link: HTMLElement }

let origin: Origin | null = null;
/** A grow started by a click is running (until its transition has finished); a panel that mounts then belongs to it. */
let pending = false;
let running: ReturnType<Document['startViewTransition']> | null = null;
let onMount: (() => void) | null = null, onUnmount: (() => void) | null = null;
/** The panel addresses shown since the shell mounted: with more than one, × only steps back to the previous panel (the shell stays). */
let trail: string[] = [];

/** The API exists, the screen is a computer (md) and motion is allowed. */
export function canGrow(): boolean {
    return typeof document !== 'undefined' && 'startViewTransition' in document
        && matchMedia('(min-width: 768px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A transition is running (a second click is ignored); the panel being shown was opened by a grow (its own CSS pop stays off). */
export const isBusy = (): boolean => running !== null;
export const isGrowing = (): boolean => running !== null && pending;

const wait = (set: (resolve: () => void) => void): Promise<void> =>
    new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, PANEL_VT_WAIT_MS);
        set(() => { clearTimeout(timer); resolve(); });
    });

const named = (el: HTMLElement | null, on: boolean) => { if (el) el.style.viewTransitionName = on ? PANEL_VT_NAME : ''; };

function track(t: NonNullable<typeof running>, done: () => void) {
    running = t;
    t.ready.catch(() => { });
    void t.finished.catch(() => { }).finally(() => { if (running === t) running = null; pending = false; done(); });
}

/** Called by PanelShell when it mounts / unmounts: a panel opened without a click on a card has no origin. */
export function panelMounted() {
    if (!pending) origin = null;
    trail = [];
    onMount?.();
}
export function panelUnmounted() { onUnmount?.(); }
export function panelPath(path: string) {
    if (trail[trail.length - 2] === path) trail.pop();
    else if (trail[trail.length - 1] !== path) trail.push(path);
}

/** The link to give focus back to (Safari does not focus a link on click, so the "opener" there is <body>). */
export function originLink(): HTMLElement | null {
    const card = origin && liveCard(origin);
    return card && origin ? (card.contains(origin.link) ? origin.link : card.querySelector<HTMLElement>('a[data-opens-panel]')) : null;
}

/** The remembered card, or the same card found again by its key (the list re-rendered); never one inside a dialog. */
function liveCard(o: Origin): HTMLElement | null {
    if (o.card.isConnected && o.card.getClientRects().length > 0) return o.card;
    const found = [...document.querySelectorAll<HTMLElement>(`[data-panel-origin="${CSS.escape(o.key)}"]`)]
        .find((el) => !el.closest('[aria-modal="true"]') && el.getClientRects().length > 0);
    if (found) o.card = found;
    return found ?? null;
}

/** On screen: at least part of the card is inside the page area below the header. */
function onScreen(card: HTMLElement): boolean {
    const r = card.getBoundingClientRect();
    const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    return r.bottom > top && r.top < innerHeight;
}

/** Open: the card is named, the panel's address is pushed, then the panel takes the name; the browser morphs one into the other. */
export function growFrom(link: HTMLElement, card: HTMLElement, navigate: () => void) {
    origin = { key: card.dataset.panelOrigin ?? '', card, link };
    pending = true;
    named(card, true);
    const t = document.startViewTransition(async () => {
        const mounted = wait((r) => { onMount = r; });
        try { navigate(); } catch { onMount = null; }
        await mounted;
        onMount = null;
        named(card, false);
        named(document.getElementById(PANEL_DIALOG_ID), true);
    });
    track(t, () => { named(card, false); named(document.getElementById(PANEL_DIALOG_ID), false); });
}

/** Close (×, Esc, the dim): the panel shrinks into its card, or fades when there is none on screen. Back and reduced motion close at once. */
export function shrinkOrClose(back: () => void) {
    if (trail.length > 1 || !canGrow()) { back(); return; }
    if (running) { running.skipTransition(); back(); return; }
    const panel = document.getElementById(PANEL_DIALOG_ID);
    const card = origin ? liveCard(origin) : null;
    const target = card && onScreen(card) ? card : null;
    const html = document.documentElement;
    if (panel && target) { html.classList.add('vt-shrink'); named(panel, true); }
    const t = document.startViewTransition(async () => {
        const gone = wait((r) => { onUnmount = r; });
        back();
        await gone;
        onUnmount = null;
        if (panel && target) { named(panel, false); named(target, true); }
    });
    track(t, () => { html.classList.remove('vt-shrink'); named(panel, false); named(card, false); origin = null; });
}
