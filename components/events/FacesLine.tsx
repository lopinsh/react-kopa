import { useTranslations } from 'next-intl';
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
        <p data-ui={UI.facesLine} className="flex items-center gap-2 text-sm text-foreground-muted">
            {faces.length > 0 && (
                <span aria-hidden="true" className="flex shrink-0">
                    {faces.map((f, i) => (
                        <img key={f.id} src={f.image} alt="" referrerPolicy="no-referrer" className={`size-5 rounded-full object-cover ring-2 ring-surface ${i > 0 ? '-ml-1.5' : ''}`} />
                    ))}
                </span>
            )}
            <span>{sentence}</span>
        </p>
    );
}
