'use client';

import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import { useHubContext } from '@/components/providers/HubProvider';
import HubCityRequestSheet from './HubCityRequestSheet';

/** `?request=<city>` on a topic hub (a shared "help open it" link, or the return from sign-in): opens the request sheet on load (K3-11). */
export default function HubRequestFromUrl() {
    const hub = useHubContext();
    const search = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const segment = search.get('request');
    const city = segment && !hub.local ? hub.kur.find((c) => c.segment === segment.toLowerCase()) : undefined;
    if (!city || city.status === 'open' || city.viewerRequested) return null;
    return <HubCityRequestSheet segment={city.segment} onClose={() => router.replace(pathname, { scroll: false })} />;
}
