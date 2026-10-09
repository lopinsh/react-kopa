export type OAuthProviderId = 'github' | 'google';

/** OAuth providers whose credentials are set; the sign-in forms only offer these. Server only. */
export function getConfiguredOAuthProviders(): OAuthProviderId[] {
    const providers: OAuthProviderId[] = [];
    if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) providers.push('github');
    if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) providers.push('google');
    return providers;
}
