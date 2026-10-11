import type { RedesignMeta } from '@/lib/validations/development';

export interface RedesignLabels {
    version: string;
    updated: string;
    changesTitle: string;
    markAll: string;
    badgeNew: string;
    badgeUpdated: string;
    badgeHint: string;
}

function esc(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Fills the version block into the page header and puts a New/Updated badge before each changed section's heading.
 * Badges start hidden; `RedesignReview` shows the ones the viewer has not dismissed yet.
 */
export function decorateRedesign(html: string, meta: RedesignMeta, labels: RedesignLabels): string {
    const changes = meta.changes.length > 0
        ? `<details><summary>${esc(labels.changesTitle)}</summary><ul>${meta.changes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></details>`
        : '';
    const block = `<div class="rd-version"><span><b>${esc(labels.version)}</b> · ${esc(labels.updated)}</span>${changes}<button type="button" data-rd-dismiss-all>${esc(labels.markAll)}</button></div>`;
    let out = html.replace('<!--rd-meta-->', block);

    for (const [id, section] of Object.entries(meta.sections)) {
        const heading = `<h2 id="${id}"`;
        if (!out.includes(heading)) continue;
        const label = section.kind === 'new' ? labels.badgeNew : labels.badgeUpdated;
        const badge = `<button type="button" class="rd-badge" hidden data-rd-badge data-rd-section="${id}" data-rd-version="${esc(section.version)}" data-rd-kind="${section.kind}" title="${esc(labels.badgeHint)}">${esc(label)}</button>`;
        out = out.replace(heading, badge + heading);
    }
    return out;
}
