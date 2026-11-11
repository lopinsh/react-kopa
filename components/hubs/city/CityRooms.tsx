'use client';

import { useState } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { HUB_GROUP_TIERS } from '@/lib/constants';
import { relativeTo } from '@/lib/utils/relative-time';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';

export interface CityRoomRow {
    slug: string;
    title: string;
    href: string;
    groupCount: number;
    lastActivityAt: Date | null;
}

/**
 * Pilsētas istabas (K3-20, K-107): the city's open topic x city hubs as compact rows "Šahs · Jelgava", meta "N grupas · {relative}", the first 16;
 * "Vēl N istabas" shows the rest in place (a link to the Katalogs comes with K5).
 */
export default function CityRooms({ rooms, cityName }: { rooms: CityRoomRow[]; cityName: string }) {
    const t = useTranslations('hub');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const [all, setAll] = useState(false);
    const shown = all ? rooms : rooms.slice(0, HUB_GROUP_TIERS.list);
    const more = rooms.length - shown.length;

    return (
        <div className="rounded-2xl bg-surface px-4 shadow-card frame">
            {shown.map((r) => (
                <Link key={r.href} href={r.href} className="flex min-h-11 items-center justify-between gap-3 border-0 border-t border-dashed border-border py-2 first:border-t-0">
                    <span className="min-w-0 truncate text-body-sm text-foreground">{t('localName', { name: r.title, city: cityName })}</span>
                    <span className="shrink-0 text-meta text-foreground-muted">
                        {t('kur.groups', { count: r.groupCount })}
                        {r.lastActivityAt && <>{' · '}{relativeTo(format, new Date(r.lastActivityAt), now)}</>}
                    </span>
                </Link>
            ))}
            {more > 0 && (
                <div className="border-0 border-t border-dashed border-border py-2">
                    <button type="button" onClick={() => setAll(true)} className={TEXT_LINK_CLASS}>{t('city.moreRooms', { count: more })}</button>
                </div>
            )}
        </div>
    );
}
