'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { loadFullPage } from '@/lib/full-page';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { addMinutesLocal, localTimeExists, minutesBetween, nextFullHourLocal, toLocalValue } from '@/lib/local-datetime';
import { TEXT_LANGS, firstLangWithError, langRecord, toTextLang, type TextLang } from '@/lib/translations';
import { isOverLimit } from '@/lib/text-limit';
import { eventSchema, EVENT_TITLE_MAX, type EventFormValues, type EventFormData } from '@/lib/validations/event';
import { createEvent, updateEvent } from '@/actions/event-actions';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES } from '@/lib/constants';
import type { EventToEdit } from '@/components/forms/event/EventForm';

export type StepIndex = 0 | 1;

type Options = { groupId: string; groupSlug: string; l1Slug: string; event?: EventToEdit; waitingCount: number };

// A lost connection rejects the action: show it as a failed save and keep the form (an uncaught rejection would drop it for the error page).
const SAVE_FAILED = { success: false as const, error: 'SAVE_FAILED' };

/** State and handlers of the event form (create and edit): the fields, the step, the language on screen, saving. */
export function useEventForm({ groupId, groupSlug, l1Slug, event, waitingCount }: Options) {
    const locale = useLocale();
    const router = useRouter();
    const groupCity = useGroupContext().city;
    const [step, setStep] = useState<StepIndex>(0);
    // One language switch for the whole form; it opens on the original language.
    const originalAtStart = event?.originalLang ?? toTextLang(locale);
    const [lang, setLang] = useState<TextLang>(originalAtStart);
    // Bumped when text is copied in, so the rich-text editors reload their value.
    const [rev, setRev] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    // Opening a Request-to-join event lets in everyone waiting: ask before doing it.
    const [askingToOpen, setAskingToOpen] = useState(false);

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
        },
        mode: 'onChange',
    });
    const { handleSubmit, formState: { errors }, setValue, getValues, trigger, setError } = form;
    const watched = useWatch({ control: form.control });
    // Once the organiser empties the end, start changes stop filling it in again.
    const endLeftEmpty = useRef(!!event && !event.endDate);

    // Done after mount because the server renders in its own zone (UTC in production), not the viewer's:
    // computing these during render would show server-zone times and mismatch on hydration.
    // Editing: the stored times in the browser zone. New event: start at the next full hour.
    useEffect(() => {
        if (getValues('startDate')) return;
        if (event) {
            setValue('startDate', toLocalValue(event.startDate));
            setValue('endDate', toLocalValue(event.endDate));
            return;
        }
        const start = nextFullHourLocal();
        setValue('startDate', start);
        setValue('endDate', addMinutesLocal(start, 120));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** The end moves with the start: same length as before, or 2 hours when there was none. */
    function changeStart(next: string) {
        const previousStart = String(getValues('startDate') ?? '');
        const previousEnd = String(getValues('endDate') ?? '');
        setValue('startDate', next, { shouldDirty: true, shouldValidate: true });
        if (!next) return;
        if (previousEnd) {
            const length = previousStart ? minutesBetween(previousStart, previousEnd) : null;
            setValue('endDate', addMinutesLocal(next, length && length > 0 ? length : 120), { shouldDirty: true, shouldValidate: true });
        } else if (!endLeftEmpty.current) {
            setValue('endDate', addMinutesLocal(next, 120), { shouldDirty: true, shouldValidate: true });
        }
    }

    function changeEnd(next: string) {
        endLeftEmpty.current = next === '';
        setValue('endDate', next, { shouldDirty: true, shouldValidate: true });
    }

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
            // The hour the clocks skip would silently become the next one: ask for another time (client-only, see localTimeExists).
            const skipped = (['startDate', 'endDate'] as const).filter((n) => {
                const v = String(getValues(n) ?? '');
                return v !== '' && !localTimeExists(v);
            });
            skipped.forEach((n) => setError(n, { type: 'custom', message: 'TIME_SKIPPED' }));
            return valid && skipped.length === 0;
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

    const opensToWaiting = !!event && event.joinMode === 'REQUEST' && watched.joinMode === 'OPEN' && waitingCount > 0;

    const submitForm = handleSubmit((data) => {
        if (opensToWaiting) {
            setAskingToOpen(true);
            return;
        }
        save(data, false);
    }, showTextProblem);
    // Enter in a step-1 field moves to the next step instead of creating the event early.
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (step < 1) {
            e.preventDefault();
            if (!titleOver) void nextStep();
            return;
        }
        void submitForm(e);
    };
    const onConfirmOpen = handleSubmit((data) => {
        setAskingToOpen(false);
        save(data, true);
    }, showTextProblem);

    return {
        form, watched, step, lang, setLang, rev, originalAtStart, isPending, serverError, askingToOpen, setAskingToOpen,
        opensToWaiting, titleOver, langsWithErrors, changeStart, changeEnd, nextStep, prevStep, copyFromOriginal, clearText,
        changeOriginal, onSubmit, onConfirmOpen,
    };
}
