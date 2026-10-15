'use client';

import { useTranslations } from 'next-intl';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';

type Props = {
    event: {
        title: string;
        /** Plain text: the page strips the tags. Never the practical info. */
        description: string;
        /** Address with the city, or the online link; empty when none may be shown. */
        location: string;
        startDate: Date;
        endDate?: Date;
    };
};

const stamp = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

/** "Pievienot kalendāram": a text link that opens Google Calendar with the event filled in; the end defaults to one hour. */
export default function AddToCalendar({ event }: Props) {
    const t = useTranslations('event');
    const end = event.endDate ?? new Date(event.startDate.getTime() + 3600000);
    const href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${stamp(event.startDate)}/${stamp(end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`${TEXT_LINK_CLASS} ml-1 whitespace-nowrap`}>
            {t('addToCalendar')}
        </a>
    );
}
