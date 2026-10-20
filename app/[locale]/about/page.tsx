import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

const POINTS = ['awkward', 'groups', 'glance', 'calm', 'honest', 'nonprofit'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'pages' });
    return { title: t('about.title') };
}

export default async function AboutPage() {
    const t = await getTranslations('pages');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <h1 className="text-title text-foreground">{t('about.title')}</h1>
            <p className="mt-4 text-section text-foreground">{t('about.lead')}</p>
            <ul className="mt-8 space-y-5">
                {POINTS.map((key) => (
                    <li key={key}>
                        <p className="weight-strong text-foreground">{t(`about.points.${key}.title`)}</p>
                        <p className="text-foreground-muted">{t(`about.points.${key}.text`)}</p>
                    </li>
                ))}
            </ul>
            <Link
                href="/"
                className="mt-10 inline-flex h-11 items-center rounded-pill bg-primary px-6 text-button-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
                {t('about.cta')}
            </Link>
        </div>
    );
}
