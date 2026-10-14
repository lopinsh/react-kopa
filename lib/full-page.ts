/**
 * Loads an address as a full page (a document load, like opening a shared link). A soft click on a group's or an event's address opens
 * its panel (R6); after a save or leaving a group the person wants the page itself. Client only; `path` carries the locale prefix.
 */
export function loadFullPage(path: string): void {
    window.location.assign(path);
}
