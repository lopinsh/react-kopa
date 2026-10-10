import { UI_NAMES, type UiName } from '@/lib/constants';

/** Browser-side helpers for feedback mode: describe a clicked element, and find it again later. */

const MAX_SEGMENTS = 6;
const TEXT_LENGTH = 120;

/** Generated ids (React `:r1:`, Radix, Headless UI) change between loads, so they make poor anchors. */
function isStableId(id: string): boolean {
    return id !== '' && !/^[:«]|^radix-|^headlessui-|^\d/.test(id) && !/\s/.test(id);
}

function segment(el: Element): string {
    const tag = el.tagName.toLowerCase();
    const same = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.tagName === el.tagName) : [];
    return same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(el) + 1})` : tag;
}

function anchor(el: Element): string | null {
    if (isStableId(el.id)) return `#${CSS.escape(el.id)}`;
    const testId = el.getAttribute('data-testid');
    return testId ? `[data-testid="${CSS.escape(testId)}"]` : null;
}

/**
 * A short selector: the element's own id/data-testid if it has one, otherwise a path of
 * `tag:nth-of-type(n)` steps up to the nearest ancestor with a stable id (or at most six steps,
 * joined with a plain descendant combinator when the path is cut short).
 */
export function buildSelector(el: Element): string {
    const own = anchor(el);
    if (own) return own;

    const steps: string[] = [];
    let node: Element | null = el;
    let root: string | null = null;
    while (node && node !== document.body && node !== document.documentElement) {
        const a = anchor(node);
        if (a) { root = a; break; }
        steps.unshift(segment(node));
        node = node.parentElement;
    }
    const cut = steps.length > MAX_SEGMENTS;
    const path = steps.slice(-MAX_SEGMENTS).join(' > ');
    if (root) return cut ? `${root} ${path}` : `${root} > ${path}`;
    return path;
}

/** Finds the element for a stored selector, or null if the page no longer has it. */
export function findBySelector(selector: string): Element | null {
    try {
        return document.querySelector(selector);
    } catch {
        return null;
    }
}

/** What a person would read on the element: collapsed whitespace, first ~120 characters. */
export function visibleText(el: Element): string {
    const raw = el instanceof HTMLElement ? el.innerText : el.textContent ?? '';
    return raw.replace(/\s+/g, ' ').trim().slice(0, TEXT_LENGTH);
}

/**
 * True when something else (e.g. an open pop-up and its backdrop) lies over the element's centre,
 * so its pin would float on top of that pop-up. Feedback mode's own layers don't count. A pop-up rendered
 * inside the element (e.g. the join pop-up inside the group header) still covers it: anything `fixed`
 * between the element and the point counts as a layer on top.
 */
export function isCovered(el: Element, rect: DOMRect): boolean {
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const top = document.elementFromPoint(x, y);
    if (!top || top.closest('[data-feedback-ignore]')) return false;
    if (top.contains(el)) return false;
    if (!el.contains(top)) return true;
    for (let node: Element | null = top; node && node !== el; node = node.parentElement) {
        if (getComputedStyle(node).position === 'fixed') return true;
    }
    return false;
}

/** The `data-ui` name of the closest named component around (or at) an element, if it is a known one. */
export function componentOf(el: Element | null): UiName | null {
    const name = el?.closest('[data-ui]')?.getAttribute('data-ui');
    return UI_NAMES.find((n) => n === name) ?? null;
}
