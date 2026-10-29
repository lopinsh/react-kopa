import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHead from '@/components/ui/PageHead';
import UnsubscribeButton from '@/components/email/UnsubscribeButton';
import { verifyUnsubscribe } from '@/lib/email/unsubscribe-token';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ u?: string | string[]; s?: string | string[] }> };

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'email.unsubscribe' });
    return { title: t('title'), robots: { index: false } };
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Unsubscribe from the email digest with the signed link of an email (R33). Opening the page changes nothing: the button does. */
export default async function UnsubscribePage({ searchParams }: Pick<Props, 'searchParams'>) {
    const { u: rawU, s: rawS } = await searchParams;
    const u = first(rawU);
    const s = first(rawS);
    const t = await getTranslations('email.unsubscribe');
    const valid = u !== '' && s !== '' && verifyUnsubscribe(u, s);

    return (
        <div className="mx-auto grid w-full max-w-focus gap-section px-gutter py-8">
            <PageHead title={t('title')} lead={valid ? t('text') : t('invalid')} />
            {valid && <UnsubscribeButton u={u} s={s} />}
        </div>
    );
}
