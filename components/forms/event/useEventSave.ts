'use client';

import { useState, useTransition } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { loadFullPage } from '@/lib/full-page';
import type { EventFormValues, EventFormData } from '@/lib/validations/event';
import { createEvent, updateEvent } from '@/actions/event-actions';
import type { EventToEdit } from '@/components/forms/event/EventForm';

// A lost connection rejects the action: show it as a failed save and keep the form (an uncaught rejection would drop it for the error page).
const SAVE_FAILED = { success: false as const, error: 'SAVE_FAILED' };

type Options = {
    form: UseFormReturn<EventFormData>;
    groupId: string;
    groupSlug: string;
    l1Slug: string;
    event?: EventToEdit;
    waitingCount: number;
    step: number;
    titleOver: boolean;
    nextStep: () => Promise<void>;
    onInvalid: () => void;
};

/** Saving the event form: submit, the confirm before opening a Request-to-join event to everyone waiting, the redirect. */
export function useEventSave({ form, groupId, groupSlug, l1Slug, event, waitingCount, step, titleOver, nextStep, onInvalid }: Options) {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    // Opening a Request-to-join event lets in everyone waiting: ask before doing it.
    const [askingToOpen, setAskingToOpen] = useState(false);
    const joinMode = useWatch({ control: form.control, name: 'joinMode' });
    const opensToWaiting = !!event && event.joinMode === 'REQUEST' && joinMode === 'OPEN' && waitingCount > 0;

    function save(data: EventFormData, confirmOpenWaiting: boolean) {
        setServerError(null);
        startTransition(async () => {
            const values = data as unknown as EventFormValues;
            let eventSlug: string;
            if (event) {
                const result = await updateEvent(event.id, values, locale, confirmOpenWaiting).catch(() => SAVE_FAILED);
                if (!result.success) {
                    setServerError(result.error);
                    // Someone new started waiting since the page loaded: refresh the count and ask again.
                    if (result.error === 'CONFIRMATION_REQUIRED') router.refresh();
                    return;
                }
                eventSlug = result.data!.eventSlug;
            } else {
                const result = await createEvent(groupId, values, locale).catch(() => SAVE_FAILED);
                if (!result.success) {
                    setServerError(result.error);
                    return;
                }
                eventSlug = result.data!.event.slug;
            }
            // Land on the event's own page, in full (a soft click on an event's address would open its panel).
            loadFullPage(`/${locale}/${l1Slug}/group/${groupSlug}/events/${eventSlug}`);
        });
    }

    const submitForm = form.handleSubmit((data) => {
        if (opensToWaiting) {
            setAskingToOpen(true);
            return;
        }
        save(data, false);
    }, onInvalid);
    // Enter in a step-1 field moves to the next step instead of creating the event early.
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (step < 1) {
            e.preventDefault();
            if (!titleOver) void nextStep();
            return;
        }
        void submitForm(e);
    };
    const onConfirmOpen = form.handleSubmit((data) => {
        setAskingToOpen(false);
        save(data, true);
    }, onInvalid);

    return { isPending, serverError, askingToOpen, setAskingToOpen, opensToWaiting, onSubmit, onConfirmOpen };
}
