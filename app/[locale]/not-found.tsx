import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import SignInHint from '@/components/shell/SignInHint';

export default async function NotFound() {
    const t = await getTranslations('pages.notFound');
    const session = await auth();

    return (
        <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
            <p className="text-body-sm text-foreground-muted">404</p>
            <h1 className="mt-2 text-title text-foreground">{t('title')}</h1>
            <p className="mt-4 text-foreground">{t('body')}</p>
            <Link
                href="/"
                className="mt-10 inline-flex h-11 items-center rounded-pill bg-primary px-6 text-button-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
                {t('cta')}
            </Link>
            {!session?.user && <SignInHint />}
        </div>
    );
}
