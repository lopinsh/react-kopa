import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import UsernameForm from '@/components/onboarding/UsernameForm';
import { signInUrl } from '@/lib/auth-redirect';
import { usernameFromName } from '@/lib/username';
import { usernameSchema } from '@/lib/validations/onboarding';
import { UserService } from '@/lib/services/user.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'onboarding.username' });
    return { title: t('heading') };
}

/**
 * Onboarding — username selection page.
 *
 * Server Component. No main nav/sidebar — this is a focused,
 * one-time task that should not compete for attention.
 *
 * Guards:
 *  - No session → redirect to sign-in
 *  - Session with username already set → redirect to /profile
 */
export default async function UsernameOnboardingPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(signInUrl(locale, '/onboarding/username'));
    }

    // If the user already has a username, they shouldn't be here.
    // The middleware handles this for normal navigation, but we guard
    // here too for direct URL access and SSR consistency.
    if (session.user.username) {
        redirect(`/${locale}/profile`);
    }

    const t = await getTranslations('onboarding.username');

    // Pre-fill a free handle from the account name (e.g. "Līga Kalniņa" from Google -> liga_kalnina).
    const base = usernameFromName(session.user.name ?? '');
    const suggestedUsername = usernameSchema.safeParse(base).success
        ? await UserService.suggestAvailableUsername(base)
        : '';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
            {/* Minimal card */}
            <div className="w-full max-w-md">
                {/* App identity */}
                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-section text-primary-foreground shadow-premium shadow-primary/30">
                        EK
                    </div>
                    <p className="text-body-sm text-foreground-muted">
                        Ejam Kopā
                    </p>
                </div>

                {/* Heading & subtext */}
                <h1 className="mb-3 text-center text-title text-foreground">
                    {t('heading')}
                </h1>
                <p className="mb-10 text-center text-body-sm text-foreground-muted">
                    {t('subtext')}
                </p>

                {/* Form — client component handles all interactivity */}
                <div className="rounded-4xl line bg-surface p-8">
                    <UsernameForm suggestedUsername={suggestedUsername} />
                </div>
            </div>
        </div>
    );
}
