import { useTranslations } from 'next-intl';
import Faces from '@/components/ui/Faces';
import { FACES_MAX, UI } from '@/lib/constants';
import type { EventPanelData } from '@/lib/services/event-panel';

/**
 * Who is going (AR-10, D12): signed-in viewers see up to three faces and one name ("Ilze un vēl 11 iet", "Tu un vēl 11 iet"); visitors get
 * the number ("12 iet") because the service sends them no people at all. Private profiles are counted but never shown. Nobody going, or the
 * event is over: no line.
 */
export default function FacesLine({ going, ended }: { going: EventPanelData['going']; ended: boolean }) {
    const t = useTranslations('event.panel');
    if (going.count === 0 || ended) return null;

    const { people, count, viewerGoing } = going;
    const faces = (people ?? []).slice(0, FACES_MAX);
    const named = faces.find((f) => f.name);
    const others = count - 1;
    const sentence = people === null || (!viewerGoing && !named)
        ? t('goingCount', { count })
        : viewerGoing
            ? t('goingYou', { others })
            : t('goingNamed', { name: named?.name ?? '', others });

    return (
        <p data-ui={UI.facesLine} className="flex items-center gap-2 text-body-sm text-foreground-muted">
            <Faces faces={faces} />
            <span>{sentence}</span>
        </p>
    );
}
