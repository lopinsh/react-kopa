'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { useGroupContext } from '@/components/providers/GroupProvider';

// line-clamp (like truncate) clips at the padding box: the 0.2em padding (cancelled by the margin) keeps Latvian macrons and descenders visible at the tight title line.
// The name is the page title (text-title from md); as a breadcrumb on event pages it stays item-sized so it does not compete with the event's own title.
const NAME = 'text-item md:text-title';
const CRUMB = 'text-item';

/**
 * The group's name in the banner. On the event pages (an event, its edit page, the create page) it becomes a breadcrumb,
 * "Group › Visi pasākumi" (cmv9b80zl): the page's own heading is then the event, so the name is not a heading there. Elsewhere it is
 * the page's `<h1>`. Reads the segments below the group layout, which is where the banner lives.
 */
export default function BannerName() {
    const t = useTranslations('group.frame');
    const tEvent = useTranslations('event');
    const g = useGroupContext();
    const [first, second] = useSelectedLayoutSegments();
    const inEvents = (first === 'events' && !!second) || first === 'create-event';

    if (!inEvents) return <h1 className={clsx('line-clamp-2 break-words py-[0.2em] -my-[0.2em]', NAME)}>{g.name}</h1>;
    return (
        <nav aria-label={t('breadcrumb')}>
            <p className={clsx('flex items-center gap-1', CRUMB)}>
                <Link href={g.href} className="min-w-0 truncate hover:underline">{g.name}</Link>
                <ChevronRight aria-hidden className="size-3.5 shrink-0" />
                <Link href={`${g.href}/events`} className={clsx('shrink-0 font-sans font-normal hover:underline', 'tile-ink-muted')}>{tEvent('allEvents')}</Link>
            </p>
        </nav>
    );
}
