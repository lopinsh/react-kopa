'use client';

import { Calendar } from 'lucide-react';

type Props = {
    event: {
        title: string;
        description: string;
        location: string;
        startDate: Date;
        endDate?: Date;
    };
    accentColor: string;
};

export default function AddToCalendar({ event, accentColor }: Props) {
    const generateGoogleLink = () => {
        const base = 'https://www.google.com/calendar/render?action=TEMPLATE';
        const text = encodeURIComponent(event.title);
        const dates = `${event.startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${(event.endDate || new Date(event.startDate.getTime() + 3600000)).toISOString().replace(/-|:|\.\d\d\d/g, '')}`;
        const details = encodeURIComponent(event.description.replace(/<[^>]*>?/gm, ''));
        const location = encodeURIComponent(event.location);

        return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    };

    return (
        <a
            href={generateGoogleLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-[11px] font-bold text-foreground transition-all hover:bg-surface-elevated active:scale-[0.98]"
        >
            <Calendar className="h-3.5 w-3.5" style={{ color: accentColor }} />
            ADD TO GOOGLE CALENDAR
        </a>
    );
}
