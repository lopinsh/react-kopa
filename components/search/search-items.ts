/** The things the arrow keys move through, in DOM order: recent searches, group rows, event rows, "Rādīt visus rezultātus". */
export const SEARCH_ITEM = '[data-search-item]';

export function searchItems(root: ParentNode): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(SEARCH_ITEM));
}

/** ↓ in the field: focus the panel's first item, if it has one. */
export function focusFirstItem(panelId: string): void {
    const panel = document.getElementById(panelId);
    if (panel) searchItems(panel)[0]?.focus();
}
