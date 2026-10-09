'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import AuthTextField from './AuthTextField';
import OAuthButtons from './OAuthButtons';

interface SignInFormProps {
    /** Safe same-origin path to continue to after signing in (or registering). */
    callbackUrl: string;
}

/** The one sign-in form: used by the sign-in page and the sign-in pop-up. */
export default function SignInForm({ callbackUrl }: SignInFormProps) {
    const t = useTranslations('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
            redirectTo: callbackUrl,
        });

        if (!res || res.error) {
            setError(t('invalidCredentials'));
            setLoading(false);
            return;
        }

        // Full navigation so server components pick up the new session.
        window.location.assign(callbackUrl);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthTextField
                    id="email"
                    type="email"
                    label={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    autoComplete="username"
                    required
                />
                <AuthTextField
                    id="password"
                    type="password"
                    label={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? t('signingIn') : t('signInButton')}
                </button>
            </form>

            <p className="text-center text-sm text-foreground-muted">
                {t('noAccount')}{' '}
                <Link
                    href={{ pathname: '/auth/register', query: { callbackUrl } }}
                    className="font-medium text-primary hover:underline"
                >
                    {t('createAccount')}
                </Link>
            </p>

            <OAuthButtons callbackUrl={callbackUrl} />
        </div>
    );
}
