import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = [
    { title: 'privacy.dataTitle', items: ['privacy.data1', 'privacy.data2', 'privacy.data3'] },
    { title: 'privacy.visibilityTitle', items: ['privacy.visibility1', 'privacy.visibility2'] },
    { title: 'privacy.cookiesTitle', items: ['privacy.cookies1', 'privacy.cookies2', 'privacy.cookies3', 'privacy.cookies4'] },
    { title: 'privacy.rightsTitle', items: ['privacy.rights1'] },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'pages' });
    return { title: t('privacy.title') };
}

export default async function PrivacyPage() {
    const t = await getTranslations('pages');

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <p className="mb-6 rounded-xl line bg-surface px-4 py-3 text-body-sm text-foreground-muted">
                {t('draftNotice')}
            </p>
            <h1 className="text-title text-foreground">{t('privacy.title')}</h1>
            <p className="mt-4 text-foreground">{t('privacy.intro')}</p>
            {SECTIONS.map((section) => (
                <section key={section.title} className="mt-10">
                    <h2 className="text-section text-foreground">{t(section.title)}</h2>
                    <ul className="mt-3 list-disc space-y-3 pl-5 text-foreground-muted">
                        {section.items.map((key) => (
                            <li key={key}>{t(key)}</li>
                        ))}
                        {section.title === 'privacy.rightsTitle' && (
                            <li>
                                {t.rich('privacy.rights2', {
                                    mail: (chunks) => (
                                        <a href="mailto:ejam@lumm.eu" className="weight-strong text-primary hover:underline">{chunks}</a>
                                    ),
                                })}
                            </li>
                        )}
                    </ul>
                </section>
            ))}
        </div>
    );
}
