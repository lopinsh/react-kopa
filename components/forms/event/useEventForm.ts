'use client';

import { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { TEXT_LANGS, firstLangWithError, langRecord, toTextLang, type TextLang } from '@/lib/translations';
import { isOverLimit } from '@/lib/text-limit';
import { eventSchema, EVENT_TITLE_MAX, type EventFormData } from '@/lib/validations/event';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES } from '@/lib/constants';
import type { EventToEdit } from '@/components/forms/event/EventForm';
import { useEventTimes } from '@/components/forms/event/useEventTimes';
import { useEventSave } from '@/components/forms/event/useEventSave';

export type StepIndex = 0 | 1;

type Options = { groupId: string; groupSlug: string; l1Slug: string; event?: EventToEdit; waitingCount: number };

/** State and handlers of the event form (create and edit): the fields, the step, the language on screen, saving. */
export function useEventForm({ groupId, groupSlug, l1Slug, event, waitingCount }: Options) {
    const locale = useLocale();
    const groupCity = useGroupContext().city;
    const [step, setStep] = useState<StepIndex>(0);
    // One language switch for the whole form; it opens on the original language.
    const originalAtStart = event?.originalLang ?? toTextLang(locale);
    const [lang, setLang] = useState<TextLang>(originalAtStart);
    // Bumped when text is copied in, so the rich-text editors reload their value.
    const [rev, setRev] = useState(0);

    const form = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
        defaultValues: {
            originalLang: originalAtStart,
            texts: event?.texts ?? langRecord(() => ({ title: '', description: '', instructions: '' })),
            city: event?.city || groupCity,
            isOnline: event?.isOnline ?? false,
            location: event?.location ?? '',
            // Times are in the viewer's browser zone, which the server does not know: filled in after mount (see below).
            startDate: '',
            endDate: '',
            maxParticipants: event?.maxParticipants ?? undefined,
            visibility: event?.visibility ?? EVENT_VISIBILITY[0],
            joinMode: event?.joinMode ?? EVENT_JOIN_MODES[0],
            isRecurring: false,
            recurrencePattern: null,
            bannerImage: event?.bannerImage ?? '',
            bannerCredit: event?.bannerCredit ?? null,
        },
        mode: 'onChange',
    });
    const { formState: { errors }, setValue, getValues, trigger } = form;
    const watched = useWatch({ control: form.control });
    const { changeStart, changeEnd, markSkippedTimes } = useEventTimes(form, event);

    // Any language over the limit holds the form back, whichever one is showing.
    const overLimit = TEXT_LANGS.filter((l) => isOverLimit(watched.texts?.[l]?.title, EVENT_TITLE_MAX));
    const titleOver = overLimit.length > 0;
    const langsWithErrors = TEXT_LANGS.filter((l) => errors.texts?.[l] || overLimit.includes(l));
    const titlePaths = TEXT_LANGS.map((l) => `texts.${l}.title` as const);

    /** After a failed submit: a problem only in a language that is not on screen is shown (the original first), and its title takes focus. */
    function showTextProblem() {
        const failing = TEXT_LANGS.filter((l) => form.getFieldState(`texts.${l}.title`).error);
        if (failing.length === 0) return;
        const target = failing.includes(lang) ? lang : firstLangWithError(failing, getValues('originalLang'));
        if (!target) return;
        setStep(0);
        setLang(target);
        window.setTimeout(() => form.setFocus(`texts.${target}.title`), 50);
    }

    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) {
            const valid = await trigger([...titlePaths, 'startDate', 'endDate', 'city', 'location']);
            return markSkippedTimes() && valid;
        }
        return trigger(['visibility', 'joinMode', 'maxParticipants']);
    }

    async function nextStep() {
        const valid = await validateStep(step);
        if (valid) setStep((s) => Math.min(s + 1, 1) as StepIndex);
        else showTextProblem();
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0) as StepIndex);
    }

    function copyFromOriginal(to: TextLang) {
        const { texts, originalLang } = form.getValues();
        setValue(`texts.${to}`, { ...texts[originalLang] }, { shouldValidate: true });
        setRev((r) => r + 1);
    }

    function clearText(l: TextLang) {
        setValue(`texts.${l}`, { title: '', description: '', instructions: '' }, { shouldValidate: true });
        setRev((r) => r + 1);
    }

    // Which title is required just changed: re-check them all.
    function changeOriginal(l: TextLang) {
        setValue('originalLang', l);
        void trigger(titlePaths);
    }

    const saving = useEventSave({ form, groupId, groupSlug, l1Slug, event, waitingCount, step, titleOver, nextStep, onInvalid: showTextProblem });

    return {
        form, watched, step, lang, setLang, rev, originalAtStart, titleOver, langsWithErrors, changeStart, changeEnd,
        nextStep, prevStep, copyFromOriginal, clearText, changeOriginal, ...saving,
    };
}
