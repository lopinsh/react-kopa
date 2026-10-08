import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'pages' });
    return { title: t('about.title') };
}

export default async function AboutPage() {
    const t = await getTranslations('pages');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <p className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground-muted">
                {t('draftNotice')}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{t('about.title')}</h1>
            <p className="mt-4 text-xl font-medium text-foreground">{t('about.lead')}</p>
            <div className="mt-8 space-y-5 leading-relaxed text-foreground-muted">
                <p>{t('about.p1')}</p>
                <p>{t('about.p2')}</p>
                <p>{t('about.p3')}</p>
            </div>
            <Link
                href="/discover"
                className="mt-10 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
                {t('about.cta')}
            </Link>
        </div>
    );
}
