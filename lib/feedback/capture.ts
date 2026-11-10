/** Browser-side helpers for feedback mode: describe a clicked element, and find it again later. */

/**
 * True when the event target belongs to feedback mode's own layer or bar. Pop-ups and dropdown menus that close
 * on an outside click must ignore these, otherwise pressing a comment button on an item of an open menu closes it.
 */
/** `instanceof Element` fails for nodes of an iframe (another realm), so check the node type. */
export function isElement(target: EventTarget | null): target is Element {
    return target !== null && (target as Node).nodeType === 1;
}

export function inFeedbackLayer(target: EventTarget | null): boolean {
    return isElement(target) && target.closest('[data-feedback-ignore]') !== null;
}


/** Separates the iframe part of a selector from the path inside that frame. */
const FRAME_SEP = ' >>> ';

/** The iframe element that holds `el`'s document, or null for the top document (or a cross-origin frame). */
export function frameOf(el: Element): HTMLIFrameElement | null {
    try {
        const frame = el.ownerDocument.defaultView?.frameElement;
        return frame instanceof HTMLIFrameElement ? frame : null;
    } catch {
        return null;
    }
}

/** Same-origin iframes of a document (their `contentDocument` is readable). */
function framesOf(doc: Document): HTMLIFrameElement[] {
    return Array.from(doc.querySelectorAll('iframe')).filter((f) => {
        try { return f.contentDocument !== null && f.contentDocument.body !== null; } catch { return false; }
    });
}

/** The top document and every readable same-origin iframe document inside it (nested too). */
export function allDocuments(root: Document = document): Document[] {
    const docs: Document[] = [root];
    for (const f of framesOf(root)) if (f.contentDocument) docs.push(...allDocuments(f.contentDocument));
    return docs;
}

/** Offset of the element's document origin in the top window's viewport (0,0 for the top document). */
export function frameOffset(el: Element): { x: number; y: number } {
    let x = 0;
    let y = 0;
    for (let frame = frameOf(el); frame; frame = frameOf(frame)) {
        const r = frame.getBoundingClientRect();
        x += r.left + frame.clientLeft;
        y += r.top + frame.clientTop;
    }
    return { x, y };
}

/** The element's bounding rect in top-window viewport coordinates. */
export function viewportRect(el: Element): DOMRect {
    const r = el.getBoundingClientRect();
    const o = frameOffset(el);
    return new DOMRect(r.left + o.x, r.top + o.y, r.width, r.height);
}

/** Title of the frame holding `el`, or '' for the top document. */
function frameTitle(el: Element): string {
    const frame = frameOf(el);
    return frame ? frame.title.trim() : '';
}

/**
 * Runs `attach` for the top document and each same-origin iframe document, again for frames that load or
 * appear later. `attach` returns its cleanup. Returns the overall cleanup.
 */
export function forEachDocument(attach: (doc: Document) => () => void): () => void {
    const live = new Map<Document, () => void>();
    const sync = () => {
        const docs = new Set(allDocuments());
        for (const [doc, off] of Array.from(live)) if (!docs.has(doc)) { off(); live.delete(doc); }
        for (const doc of docs) if (!live.has(doc)) live.set(doc, attach(doc));
    };
    sync();
    const timer = window.setInterval(sync, 500);
    document.addEventListener('load', sync, true);
    return () => {
        window.clearInterval(timer);
        document.removeEventListener('load', sync, true);
        for (const off of live.values()) off();
        live.clear();
    };
}

/** Matches the `component` limit in the feedback schema. */
const COMPONENT_MAX = 200;
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
    const frame = frameOf(el);
    if (frame) {
        // A stable key beats the title, which is translated (a note made in /lv must resolve in /en).
        const key = frame.getAttribute('data-feedback-frame')?.trim();
        const title = frame.title.trim();
        const outer = key ? `iframe[data-feedback-frame="${CSS.escape(key)}"]` : title ? `iframe[title="${CSS.escape(title)}"]` : buildSelector(frame);
        return `${outer}${FRAME_SEP}${buildLocalSelector(el)}`;
    }
    return buildLocalSelector(el);
}

function buildLocalSelector(el: Element): string {
    const doc = el.ownerDocument;
    const own = anchor(el);
    if (own) return own;

    const steps: string[] = [];
    let node: Element | null = el;
    let root: string | null = null;
    while (node && node !== doc.body && node !== doc.documentElement) {
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
    const doc = el.ownerDocument;
    for (let node = el.parentElement; node && node !== doc.body && node !== doc.documentElement; node = node.parentElement) {
        const label = ancestorLabel(node);
        if (label && label !== steps[0]) steps.unshift(label);
    }
    const title = frameTitle(el);
    return [...(title ? [`"${title}"`] : []), ...steps, self].join(' \u203a ').slice(0, 600);
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
    for (const h of Array.from(el.ownerDocument.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
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
        boxX: Math.round(rect.left + (el.ownerDocument.defaultView?.scrollX ?? 0)),
        boxY: Math.round(rect.top + (el.ownerDocument.defaultView?.scrollY ?? 0)),
        boxW: Math.round(rect.width),
        boxH: Math.round(rect.height),
    };
}

/** Finds the element for a stored selector, or null if the page no longer has it. */
export function findBySelector(selector: string): Element | null {
    try {
        const at = selector.indexOf(FRAME_SEP);
        if (at === -1) return document.querySelector(selector);
        const frame = document.querySelector(selector.slice(0, at));
        const doc = frame instanceof HTMLIFrameElement ? frame.contentDocument : null;
        return doc ? doc.querySelector(selector.slice(at + FRAME_SEP.length)) : null;
    } catch {
        return null;
    }
}

/** The stored fields a note needs to be found again. */
export interface NoteAnchor {
    selector: string;
    elementText: string;
    component: string | null;
    box: { x: number; y: number; w: number; h: number } | null;
}

function sameText(el: Element, text: string): boolean {
    return text === '' || visibleText(el) === text;
}

/**
 * Finds the element a note was left on. Path selectors (`section:nth-of-type(8) > …`) break whenever a section is
 * added or removed, so the selector is only trusted when the element it finds still looks like the one noted
 * (same text, same `data-ui` name and drawing). Otherwise the page is searched for elements with the stored
 * `data-ui` name (the part of `component` before " · ") and the same visible text, preferring the same drawing
 * (the part after " · ") and then the one closest to the stored box. Old notes without a name are matched by selector only.
 */
export function findNoteElement(note: NoteAnchor): Element | null {
    const [name, ...rest] = (note.component ?? '').split(' · ');
    const context = rest.join(' · ').trim();
    const named = name.trim();

    const bySelector = findBySelector(note.selector);
    // Inside a frame there are no `data-ui` names to fall back on: the selector and the text decide.
    if (note.selector.includes(FRAME_SEP)) return bySelector && sameText(bySelector, note.elementText) ? bySelector : null;
    if (bySelector) {
        const own = bySelector.closest('[data-ui]');
        const nameOk = !named || own?.getAttribute('data-ui')?.trim() === named;
        const contextOk = !context || bySelector.closest('[data-feedback-context]')?.getAttribute('data-feedback-context')?.trim() === context;
        if (nameOk && contextOk && sameText(bySelector, note.elementText)) return bySelector;
    }
    if (!named) return bySelector;

    const candidates = allDocuments().flatMap((d) => Array.from(d.querySelectorAll('[data-ui]'))).filter((el) => el.getAttribute('data-ui')?.trim() === named);
    const inContext = context
        ? candidates.filter((el) => el.closest('[data-feedback-context]')?.getAttribute('data-feedback-context')?.trim() === context)
        : candidates;
    const pool = inContext.length ? inContext : candidates;
    const sameLook = pool.filter((el) => sameText(el, note.elementText));
    const finalists = sameLook.length ? sameLook : pool;
    // A named element that is gone from the page: hide the pin rather than pin the failed selector's hit on something unrelated.
    if (finalists.length === 0) return null;
    if (finalists.length === 1 || !note.box) return finalists[0];
    const box = note.box;
    const distance = (el: Element) => {
        const r = el.getBoundingClientRect();
        const view = el.ownerDocument.defaultView;
        return Math.abs(r.left + (view?.scrollX ?? 0) - box.x) + Math.abs(r.top + (view?.scrollY ?? 0) - box.y);
    };
    return finalists.reduce((best, el) => (distance(el) < distance(best) ? el : best));
}

/** What a person would read on the element: collapsed whitespace, first ~120 characters. */
export function visibleText(el: Element): string {
    const raw = 'innerText' in el && typeof el.innerText === 'string' ? el.innerText : el.textContent ?? '';
    return raw.replace(/\s+/g, ' ').trim().slice(0, TEXT_LENGTH);
}

/**
 * `rect` is the element's own rect in its document's viewport (not shifted by a frame offset).
 * True when something else (e.g. an open pop-up and its backdrop) lies over the element's centre,
 * so its pin would float on top of that pop-up. Feedback mode's own layers don't count. A pop-up rendered
 * inside the element (e.g. the join pop-up inside the group header) still covers it: anything `fixed`
 * between the element and the point counts as a layer on top.
 */
export function isCovered(el: Element, rect: DOMRect): boolean {
    const doc = el.ownerDocument;
    const view = doc.defaultView ?? window;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), view.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), view.innerHeight - 1);
    const top = doc.elementFromPoint(x, y);
    if (!top || top.closest('[data-feedback-ignore]')) return false;
    if (top.contains(el)) return false;
    if (!el.contains(top)) return true;
    for (let node: Element | null = top; node && node !== el; node = node.parentElement) {
        if (view.getComputedStyle(node).position === 'fixed') return true;
    }
    return false;
}

/**
 * What a note is "on": the `data-ui` name of the closest named element around (or at) the target, followed by the
 * `data-feedback-context` of the closest enclosing drawing, if any (the redesign page tags each mockup with its
 * viewport, caption and section, so notes on repeated elements can be told apart). Null when neither exists.
 */
export function componentOf(el: Element | null): string | null {
    const name = el?.closest('[data-ui]')?.getAttribute('data-ui')?.trim();
    const context = el?.closest('[data-feedback-context]')?.getAttribute('data-feedback-context')?.trim() || (el ? frameTitle(el) : '');
    const joined = [name, context].filter(Boolean).join(' · ');
    return joined ? joined.slice(0, COMPONENT_MAX) : null;
}
