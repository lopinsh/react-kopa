import { redirect } from 'next/navigation';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Legacy URL: discovery lives on the home page. Keeps filters such as ?category=… and ?tags=…. */
export default async function DiscoveryLegacyRedirect({ params, searchParams }: Props) {
    const { locale } = await params;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
        if (typeof value === 'string') query.set(key, value);
        else if (Array.isArray(value)) value.forEach((v) => query.append(key, v));
    }
    const qs = query.toString();
    redirect(`/${locale}${qs ? `?${qs}` : ''}`);
}
