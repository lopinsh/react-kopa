import { getTranslations } from 'next-intl/server';
import { ChatCatalogService } from '@/lib/services/chat-catalog.service';
import type { CityHubContext } from '@/lib/services/city-hub.service';
import ChatCatalog from '@/components/hubs/chat/ChatCatalog';

/**
 * The city's Katalogs (K5-23, K-147): its open topic x city rooms by last activity, each opening that room's Čats. A page of the city frame, not of the city
 * menu (K-133: a city has no Čats of its own).
 */
export default async function CityRoomsPage({ city, locale }: { city: CityHubContext; locale: string }) {
    const [t, rows] = await Promise.all([
        getTranslations({ locale, namespace: 'hub.chat.catalog' }),
        ChatCatalogService.forCity({ id: city.cityId, segment: city.segment, name: city.name }, locale),
    ]);
    return (
        <div className="grid min-w-0 gap-3">
            <h2 className="text-title text-foreground">{t('cityTitle', { city: city.name })}</h2>
            <ChatCatalog rows={rows} l2Id={null} />
        </div>
    );
}
