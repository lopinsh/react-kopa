import { CalendarDays } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import EmptyState from '@/components/ui/EmptyState';

/** Pasākumi of a hub: K1-2 builds the day strip and the lists; until then the page says there is nothing yet. */
export default async function EventsPage() {
    const t = await getTranslations('hub.events');
    return <EmptyState icon={CalendarDays} title={t('empty')} />;
}
