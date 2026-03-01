import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import UsernameForm from '@/components/onboarding/UsernameForm';

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
export default async function UsernameOnboardingPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    // If the user already has a username, they shouldn't be here.
    // The middleware handles this for normal navigation, but we guard
    // here too for direct URL access and SSR consistency.
    if (session.user.username) {
        redirect('/profile');
    }

    const t = await getTranslations('onboarding.username');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
            {/* Minimal card */}
            <div className="w-full max-w-md">
                {/* App identity */}
                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary text-2xl font-black text-white shadow-xl shadow-primary/30">
                        EK
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-foreground-muted">
                        Ejam Kopā
                    </p>
                </div>

                {/* Heading & subtext */}
                <h1 className="mb-3 text-center text-3xl font-black tracking-tight text-foreground">
                    {t('heading')}
                </h1>
                <p className="mb-10 text-center text-sm leading-relaxed text-foreground-muted">
                    {t('subtext')}
                </p>

                {/* Form — client component handles all interactivity */}
                <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-premium">
                    <UsernameForm />
                </div>
            </div>
        </div>
    );
}
