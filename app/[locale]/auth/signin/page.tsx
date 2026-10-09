import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import SignInForm from '@/components/auth/SignInForm';
import { safeCallbackPath } from '@/lib/auth-redirect';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth' });
    return { title: t('signInTitle') };
}

export default async function SignInPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { callbackUrl } = await searchParams;
    const t = await getTranslations('auth');

    // Only same-origin paths are honoured; anything else falls back to the localized home page.
    const requestHeaders = await headers();
    const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
    const proto = requestHeaders.get('x-forwarded-proto') ?? 'http';
    const origin = host ? `${proto}://${host}` : undefined;
    const returnTo = safeCallbackPath(callbackUrl, `/${locale}`, origin);

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">{t('signInTitle')}</h1>
                    <p className="mt-2 text-sm text-foreground-muted">{t('signInSubtitle')}</p>
                </div>

                <SignInForm callbackUrl={returnTo} />
            </div>
        </div>
    );
}
