import nodemailer, { type Transporter } from 'nodemailer';

export type MailInput = {
    /** Address to send to. */
    to: string;
    /** Only used for the log line when no SMTP is set up, so addresses never reach the logs. */
    toUserId: string;
    subject: string;
    text: string;
    html: string;
    headers?: Record<string, string>;
};

let transport: Transporter | null = null;

/**
 * Sends one email through SMTP_URL. Without SMTP_URL the email is only logged (recipient id, subject, text) and counted as 'logged'.
 * A transport error throws; the caller decides what to do per person.
 */
export async function sendMail({ to, toUserId, subject, text, html, headers }: MailInput): Promise<'sent' | 'logged'> {
    const smtp = process.env.SMTP_URL;
    if (!smtp) {
        console.info('[mail]', toUserId, subject, `\n${text}`);
        return 'logged';
    }
    transport ??= nodemailer.createTransport(smtp);
    await transport.sendMail({ from: process.env.MAIL_FROM || 'Ejam Kopā <noreply@localhost>', to, subject, text, html, headers });
    return 'sent';
}
