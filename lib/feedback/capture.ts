import { UI_NAMES, type UiName } from '@/lib/constants';

/** Browser-side helpers for feedback mode: describe a clicked element, and find it again later. */

/**
 * True when the event target belongs to feedback mode's own layer or bar. Pop-ups and dropdown menus that close
 * on an outside click must ignore these, otherwise pressing a comment button on an item of an open menu closes it.
 */
export function inFeedbackLayer(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest('[data-feedback-ignore]') !== null;
}

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

export interface ElementLocator {
    breadcrumb: string;
    outerHtml: string;
    heading: string | null;
    commit: string;
    boxX: number;
    boxY: number;
    boxW: number;
    boxH: number;
}

const UTILITY_CLASS = /[:[/]|^-?(?:p[xytrbl]?|m[xytrbl]?|w|h|gap|min|max|shadow|font|leading|tracking|text|bg|border|rounded|flex|grid|items|justify|container|inline|block|hidden|absolute|relative|fixed|sticky|overflow|z|top|left|right|bottom|inset|opacity|transition|duration|ease|cursor|select|space|col|row|order|self|place|object|aspect|size|ring|outline|fill|stroke|truncate|whitespace|underline|uppercase|lowercase|capitalize|sr-only|pointer-events|animate|backdrop|blur|from|to|via|line|break|list|decoration|tabular|tap)(?:-|$)/;

/** Classes worth showing: the project's own names, not Tailwind utilities. */
function ownClasses(el: Element, max: number): string[] {
    return Array.from(el.classList).filter((c) => !UTILITY_CLASS.test(c)).slice(0, max);
}

const LANDMARKS = new Set(['main', 'nav', 'header', 'footer', 'aside', 'dialog']);

function firstHeading(el: Element): string {
    const h = el.querySelector('h1, h2, h3');
    return h ? visibleText(h).slice(0, 60) : '';
}

/** One step of the breadcrumb for an ancestor, or null when it carries no meaning. */
function ancestorLabel(el: Element): string | null {
    const ui = el.getAttribute('data-ui');
    if (ui) return ui;
    const tag = el.tagName.toLowerCase();
    if (tag === 'section' || tag === 'article') {
        const title = firstHeading(el);
        return title ? `${tag} "${title}"` : tag;
    }
    if (el.getAttribute('role') === 'dialog') return 'dialog';
    if (LANDMARKS.has(tag)) return tag;
    const label = el.getAttribute('aria-label');
    if (label) return `"${label.slice(0, 60)}"`;
    if (isStableId(el.id)) return `#${el.id}`;
    return null;
}

/**
 * A readable path of the meaningful ancestors, ending with the element itself, e.g.
 * `main › section "A group page" › group-header › span.gpic (40×40, empty)`.
 */
export function buildBreadcrumb(el: Element): string {
    const rect = el.getBoundingClientRect();
    const classes = ownClasses(el, 2).map((c) => `.${c}`).join('');
    const empty = visibleText(el) === '' ? ', empty' : '';
    const self = `${el.tagName.toLowerCase()}${classes} (${Math.round(rect.width)}\u00d7${Math.round(rect.height)}${empty})`;
    const steps: string[] = [];
    for (let node = el.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
        const label = ancestorLabel(node);
        if (label && label !== steps[0]) steps.unshift(label);
    }
    return [...steps, self].join(' \u203a ').slice(0, 600);
}

const SCOPE_HTML_MAX = 1500;
const SCOPE_TEXT_MAX = 80;

/** A trimmed copy of the element's HTML: no scripts, styles or svg innards, short class lists, short text. */
export function buildScopeHtml(el: Element): string {
    const clone = el.cloneNode(true) as Element;
    for (const node of Array.from(clone.querySelectorAll('script, style'))) node.remove();
    for (const node of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
        if (node.tagName.toLowerCase() === 'svg') {
            for (const attr of Array.from(node.attributes)) node.removeAttribute(attr.name);
            node.replaceChildren();
            node.setAttribute('data-svg', '');
            continue;
        }
        for (const attr of Array.from(node.attributes)) {
            if (attr.name === 'style' || attr.name.startsWith('data-feedback')) node.removeAttribute(attr.name);
            else if (attr.name !== 'class' && attr.value.length > SCOPE_TEXT_MAX) node.setAttribute(attr.name, attr.value.slice(0, SCOPE_TEXT_MAX) + '…');
        }
        if (node.hasAttribute('class')) {
            const kept = ownClasses(node, 3);
            if (kept.length) node.setAttribute('class', kept.join(' '));
            else node.removeAttribute('class');
        }
    }
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const text = (t.textContent ?? '').replace(/\s+/g, ' ');
        t.textContent = text.length > SCOPE_TEXT_MAX ? `${text.slice(0, SCOPE_TEXT_MAX)}\u2026` : text;
    }
    const html = clone.outerHTML.replace(/ data-svg=""><\/svg>/g, '/>').replace(/>\s+</g, '><').trim();
    return html.length > SCOPE_HTML_MAX ? `${html.slice(0, SCOPE_HTML_MAX - 1)}\u2026` : html;
}

/** "Section title › nearest heading before the element", e.g. "A group page in the new look › Ko meklējam". */
function nearestHeading(el: Element): string | null {
    let found: Element | null = null;
    for (const h of Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
        const before = h.contains(el) || (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        if (!before) break;
        found = h;
    }
    const near = found ? visibleText(found) : '';
    // The title of the section the element sits in says more than a heading that merely comes before it.
    const section = el.closest('section, article, [role="dialog"]')?.querySelector('h1, h2, h3');
    const title = section ? visibleText(section) : '';
    const parts = [title, near].filter((p, i, all) => p !== '' && all.indexOf(p) === i);
    return parts.length ? parts.join(' › ').slice(0, 200) : null;
}

/** Everything an agent needs to find the exact element again: a breadcrumb, trimmed HTML, the nearest heading, the build and its box. */
export function locate(el: Element): ElementLocator {
    const rect = el.getBoundingClientRect();
    return {
        breadcrumb: buildBreadcrumb(el),
        outerHtml: buildScopeHtml(el),
        heading: nearestHeading(el),
        commit: (process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev').slice(0, 40),
        boxX: Math.round(rect.left + window.scrollX),
        boxY: Math.round(rect.top + window.scrollY),
        boxW: Math.round(rect.width),
        boxH: Math.round(rect.height),
    };
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
