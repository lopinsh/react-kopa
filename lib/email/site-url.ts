/** The public address of the site for links in emails, without a trailing slash. The server only has NEXTAUTH_URL at run time. */
export function siteUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
}
