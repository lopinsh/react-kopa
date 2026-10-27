'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ImagePlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import BannerPickerDialog from '@/components/forms/banner/BannerPickerDialog';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useToast } from '@/hooks/use-toast';
import { addSectionPictureAction } from '@/actions/section-picture-actions';
import { trackUnsplashPick } from '@/actions/unsplash-actions';
import { MAX_SECTION_PICTURES } from '@/lib/constants';
import type { UnsplashPick } from '@/lib/banner';

/** "Pievienot attēlus" for the team, in the section head; at the cap a limit line instead. One pick saves at once. */
export default function AddSectionPictures({ sectionId, count, l1Slug, searchEnabled }: { sectionId: string; count: number; l1Slug: string; searchEnabled: boolean }) {
    const t = useTranslations('group.pictures');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const g = useGroupContext();
    const { error } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const opener = useRef<HTMLButtonElement>(null);
    const refocus = useRef(false);
    // Focus goes back to the button once the dialog is closed and a save has finished (the button is disabled while saving).
    useEffect(() => {
        if (open || isPending || !refocus.current) return;
        refocus.current = false;
        opener.current?.focus();
    }, [open, isPending]);
    if (!g.user.isAdmin) return null;
    if (count >= MAX_SECTION_PICTURES) return <p className="text-meta text-foreground-muted">{t('limit')}</p>;

    const close = () => {
        refocus.current = true;
        setOpen(false);
    };
    const pick = (photo: UnsplashPick | null) => {
        close();
        if (!photo) return;
        startTransition(async () => {
            const result = await addSectionPictureAction(g.id, sectionId, { url: photo.url, credit: photo.credit }, locale);
            if (!result.success) return error(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            await trackUnsplashPick(photo.id);
        });
    };

    return (
        <>
            <Button ref={opener} variant="quiet" size="sm" disabled={isPending} onClick={() => setOpen(true)} className="shrink-0 whitespace-nowrap">
                <ImagePlus aria-hidden className="size-4" />
                {t('add')}
            </Button>
            {open && <BannerPickerDialog kind="section" l1Slug={l1Slug} searchEnabled={searchEnabled} selectedUrl={null} onPick={pick} onClose={close} />}
        </>
    );
}
