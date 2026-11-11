'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { RequestableTopic } from '@/lib/services/hub-city.service';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

/**
 * "Pieprasīt" on a city hub with no rooms (K-135): a list of Veidi (L2, L3 once they exist); a pick goes straight to that topic's `?request=<city>` sheet (K3-11).
 * Only L2/L3 x city can be requested, never L1 x city.
 */
export default function CityRequestPicker({ topics, cityName, citySegment }: { topics: RequestableTopic[]; cityName: string; citySegment: string }) {
    const t = useTranslations('hub');
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog">{t('kur.request')}</Button>
            {open && (
                <Modal size="sm" flush title={t('city.pickTitle', { city: cityName })} onClose={() => setOpen(false)}>
                    <ul className="max-h-[60vh] overflow-y-auto">
                        {topics.map((topic) => (
                            <li key={topic.href}>
                                <Link href={`${topic.href}?request=${citySegment}`} className="flex min-h-11 items-center justify-between gap-3 border-0 border-t border-dashed border-border px-4 py-2 first:border-t-0">
                                    <span className="min-w-0 truncate text-body-sm text-foreground">{topic.title}</span>
                                    <span className="shrink-0 truncate text-meta text-foreground-muted">{topic.parentTitle}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    );
}
