/*
 * The email digest as text and HTML (R33). No Prisma here: the service hands in finished lines.
 *
 * This file is the one documented exception to the no-inline-style rule: email clients ignore stylesheets and CSS
 * variables, so the layout is a table with inline styles and literal colours (the default light theme of
 * lib/constants/theme.ts). No images, no tracking pixel, no external assets.
 */

/** Default light theme colours (lib/constants/theme.ts), literal because emails cannot use CSS variables. */
const COLORS = { primary: '#4B5E3B', onPrimary: '#ffffff', background: '#f4f4ef', surface: '#fdfdfb', text: '#1f221c', muted: '#5f6558', line: '#dcdfd4' } as const;
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** The part of a next-intl translator this file needs. */
export type DigestTranslator = (key: 'subject' | 'more' | 'open' | 'why' | 'unsubscribe' | 'settings', values?: Record<string, string | number>) => string;

export type DigestEmailInput = {
    locale: string;
    /** Number of things before the cap (messages + folded notification rows). */
    count: number;
    /** Finished lines, newest first, already capped to the maximum. */
    lines: string[];
    /** How many lines the cap left out. */
    more: number;
    /** True when at least one line is a notification (the button then opens the bell, else the inbox). */
    hasNotifications: boolean;
    siteUrl: string;
    unsubscribeUrl: string;
    unsubscribePostUrl: string;
    t: DigestTranslator;
};

export type DigestEmail = { subject: string; text: string; html: string; headers: Record<string, string> };

/** Names and titles are user text: every interpolated string goes through this. */
export function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildDigestEmail({ locale, count, lines, more, hasNotifications, siteUrl, unsubscribeUrl, unsubscribePostUrl, t }: DigestEmailInput): DigestEmail {
    const subject = t('subject', { count });
    const allLines = more > 0 ? [...lines, t('more', { count: more })] : lines;
    const openUrl = `${siteUrl}/${locale}/${hasNotifications ? 'notifications' : 'messages'}`;
    const settingsUrl = `${siteUrl}/${locale}/settings#email`;
    const open = t('open');
    const why = t('why');
    const stop = t('unsubscribe');
    const settings = t('settings');

    const text = [subject, '', ...allLines.map((l) => `- ${l}`), '', `${open}: ${openUrl}`, '', why, `${stop}: ${unsubscribeUrl}`, `${settings} ${settingsUrl}`].join('\n');

    const rows = allLines
        .map((l) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${COLORS.line};font-size:16px;line-height:24px;color:${COLORS.text};">${escapeHtml(l)}</td></tr>`)
        .join('');
    const html = `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.background};font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${COLORS.surface};border:1px solid ${COLORS.line};border-radius:12px;"><tr><td style="padding:24px;">
<h1 style="margin:0 0 12px;font-size:22px;line-height:28px;color:${COLORS.text};">${escapeHtml(subject)}</h1>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:24px 0;"><a href="${escapeHtml(openUrl)}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:${COLORS.primary};color:${COLORS.onPrimary};font-size:16px;line-height:24px;text-decoration:none;">${escapeHtml(open)}</a></p>
<p style="margin:0;font-size:13px;line-height:20px;color:${COLORS.muted};">${escapeHtml(why)}<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:${COLORS.muted};">${escapeHtml(stop)}</a> &middot; ${escapeHtml(settings)} <a href="${escapeHtml(settingsUrl)}" style="color:${COLORS.muted};">${escapeHtml(settingsUrl)}</a></p>
</td></tr></table>
</td></tr></table>
</body></html>`;

    return {
        subject,
        text,
        html,
        headers: { 'List-Unsubscribe': `<${unsubscribePostUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    };
}
