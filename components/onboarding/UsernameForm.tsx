'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { safeCallbackPath } from '@/lib/auth-redirect';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { setUsername } from '@/actions/onboarding-actions';
import { Loader2 } from 'lucide-react';
import UsernameField from '@/components/auth/UsernameField';
import { useUsernameAvailability } from '@/components/auth/useUsernameAvailability';

interface UsernameFormProps {
    /** Free username derived from the account name (e.g. from Google), or empty. */
    suggestedUsername: string;
}

export default function UsernameForm({ suggestedUsername }: UsernameFormProps) {
    const t = useTranslations('onboarding.username');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { update } = useSession();

    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(suggestedUsername);
    const [serverError, setServerError] = useState<string | null>(null);
    const { status, suggestion, check } = useUsernameAvailability();

    // Validate the pre-filled suggestion once on mount.
    useEffect(() => {
        check(suggestedUsername);
    }, [check, suggestedUsername]);

    const handleChange = (next: string) => {
        setValue(next);
        setServerError(null);
        check(next);
    };

    const canSubmit = !isPending && status === 'available';

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        setServerError(null);

        startTransition(async () => {
            const result = await setUsername(value);
            if (result.success) {
                // Mandatory: refresh JWT token so middleware intercept clears immediately.
                await update({ username: value });
                const returnTo = safeCallbackPath(searchParams.get('callbackUrl'), '');
                if (returnTo) {
                    // Full navigation so server components pick up the refreshed session.
                    window.location.assign(returnTo);
                } else {
                    router.push('/profile');
                }
            } else if (result.error === 'USERNAME_TAKEN') {
                check(value);
            } else {
                setServerError(tErrors(result.error));
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <UsernameField
                id="username-input"
                value={value}
                status={status}
                suggestion={suggestion}
                onChange={handleChange}
                disabled={isPending}
                autoFocus
            />

            {/* Server-level error (unexpected failures) */}
            {serverError && (
                <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    {serverError}
                </p>
            )}

            <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {c('saving')}
                    </>
                ) : (
                    t('submit')
                )}
            </button>
        </form>
    );
}
