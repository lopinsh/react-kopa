import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RegisterForm from '@/components/auth/RegisterForm';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { safeCallbackPath } from '@/lib/auth-redirect';
import { Link } from '@/i18n/routing';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth.register' });
    return { title: t('title') };
}

export default async function RegisterPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { callbackUrl } = await searchParams;
    const t = await getTranslations('auth.register');
    const returnTo = safeCallbackPath(callbackUrl, `/${locale}`);

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
                    <p className="mt-2 text-sm text-foreground-muted">{t('subtitle')}</p>
                </div>

                <RegisterForm callbackUrl={returnTo} />

                <OAuthButtons callbackUrl={returnTo} />

                <div className="text-center text-sm">
                    <Link
                        href={{ pathname: '/auth/signin', query: { callbackUrl: returnTo } }}
                        className="text-primary hover:underline"
                    >
                        {t('haveAccount')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
