'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usernameOnboardingSchema } from '@/lib/validations/onboarding';
import { setUsername } from '@/actions/onboarding-actions';
import { checkUsernameAvailability } from '@/actions/onboarding-actions';
import { CheckCircle, XCircle, Loader2, AtSign } from 'lucide-react';

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function UsernameForm() {
    const t = useTranslations('onboarding.username');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { update } = useSession();

    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState('');
    const [availability, setAvailability] = useState<AvailabilityState>('idle');
    const [serverError, setServerError] = useState<string | null>(null);
    const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    /** Validate format client-side and trigger debounced availability check. */
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            setValue(raw);
            setServerError(null);

            // Clear previous debounce timer
            if (debounceTimer) clearTimeout(debounceTimer);

            const parsed = usernameOnboardingSchema.safeParse({ username: raw });
            if (!parsed.success) {
                setAvailability(raw.length === 0 ? 'idle' : 'invalid');
                return;
            }

            setAvailability('checking');
            const timer = setTimeout(async () => {
                const result = await checkUsernameAvailability(raw);
                setAvailability(result.available ? 'available' : 'taken');
            }, 300);
            setDebounceTimer(timer);
        },
        [debounceTimer],
    );

    const canSubmit =
        !isPending &&
        availability === 'available' &&
        usernameOnboardingSchema.safeParse({ username: value }).success;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) return;
        setServerError(null);

        startTransition(async () => {
            const result = await setUsername(value);
            if (result.success) {
                // Mandatory: refresh JWT token so middleware intercept clears immediately.
                await update({ username: value });
                router.push('/profile');
            } else {
                if (result.error === 'USERNAME_TAKEN') {
                    setAvailability('taken');
                } else {
                    setServerError(tErrors(result.error));
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
                <label
                    htmlFor="username-input"
                    className="block text-sm font-semibold text-foreground"
                >
                    {t('label')}
                </label>

                <div className="relative">
                    {/* @ prefix */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <AtSign className="h-4 w-4 text-foreground-muted" />
                    </div>

                    <input
                        id="username-input"
                        type="text"
                        value={value}
                        onChange={handleChange}
                        placeholder={t('placeholder')}
                        autoComplete="username"
                        autoFocus
                        maxLength={30}
                        disabled={isPending}
                        className="w-full rounded-2xl border border-border bg-surface py-3 pl-10 pr-12 text-base outline-none ring-0 transition-all placeholder:text-foreground-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                    />

                    {/* Trailing status icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        {availability === 'checking' && (
                            <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
                        )}
                        {availability === 'available' && (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        )}
                        {(availability === 'taken' || availability === 'invalid') && value.length > 0 && (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                    </div>
                </div>

                {/* Inline feedback */}
                <div className="min-h-[1.25rem] text-xs">
                    {availability === 'checking' && (
                        <span className="text-foreground-muted">{t('checking')}</span>
                    )}
                    {availability === 'available' && (
                        <span className="text-emerald-500 font-medium">{t('available')}</span>
                    )}
                    {availability === 'taken' && (
                        <span className="text-red-500 font-medium">{t('taken')}</span>
                    )}
                    {availability === 'idle' && (
                        <span className="text-foreground-muted">{t('hint')}</span>
                    )}
                    {availability === 'invalid' && value.length > 0 && (
                        <span className="text-foreground-muted">{t('hint')}</span>
                    )}
                </div>
            </div>

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
                        {t('submitting')}
                    </>
                ) : (
                    t('submit')
                )}
            </button>
        </form>
    );
}
