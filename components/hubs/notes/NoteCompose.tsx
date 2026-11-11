'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { HUB_NOTE_ACTIVE_MAX } from '@/lib/constants';
import { useHubContext } from '@/components/providers/HubProvider';
import TextLink from '@/components/ui/TextLink';
import Button from '@/components/ui/Button';
import type { NoteComposeOptions } from '@/lib/services/hub-note.service';
import NoteForm from './NoteForm';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/**
 * "Rakstīt ziņu" above the list (K-90): the button opens the form in place (`?compose=1` opens it on load). At the 3-note limit it shows the limit and a link to
 * Manas instead of the form (K-27a). Signed out (`options` null) it opens the sign-in pop-up, which returns here with the form open.
 */
export default function NoteCompose({ options, mineHref, startOpen }: { options: NoteComposeOptions | null; mineHref: string; startOpen: boolean }) {
    const t = useTranslations('hub.notes');
    const locale = useLocale();
    const hub = useHubContext();
    const [open, setOpen] = useState(startOpen && !!options);
    const [gate, setGate] = useState(startOpen && !options);
    const full = !!options && options.activeCount >= HUB_NOTE_ACTIVE_MAX;

    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
            {!open && <Button className="justify-self-start" onClick={() => (options ? setOpen(true) : setGate(true))}><Pencil aria-hidden />{t('write')}</Button>}
            {open && options && (full ? (
                <div className="grid justify-items-start gap-1">
                    <p className="text-body-sm text-foreground">{t('limit', { max: HUB_NOTE_ACTIVE_MAX })}</p>
                    <TextLink href={mineHref}>{t('tabMine')}</TextLink>
                </div>
            ) : (
                <div className="rounded-2xl bg-surface p-4 shadow-card frame">
                    <NoteForm options={options} hubSlug={hub.slug} fixedCity={hub.local ? { slug: hub.local.citySlug, name: hub.local.cityName } : undefined} onDone={() => setOpen(false)} />
                </div>
            ))}
            {gate && <AuthGateModal isOpen onClose={() => setGate(false)} returnTo={`/${locale}${hub.href}/messages?compose=1`} />}
        </div>
    );
}
