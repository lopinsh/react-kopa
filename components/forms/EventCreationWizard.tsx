'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm, useWatch, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale, useTimeZone } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { clsx } from 'clsx';
import {
    Calendar,
    MapPin,
    Type,
    AlignLeft,
    Users,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Eye,
    Image as ImageIcon,
    HelpCircle,
    UserCheck,
} from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import EventLangBar from '@/components/forms/EventLangBar';
import DateTimeField from '@/components/forms/DateTimeField';
import { addMinutesLocal, minutesBetween, nextFullHourLocal, splitLocal, toLocalValue } from '@/lib/local-datetime';
import { toTextLang, type TextLang } from '@/lib/translations';

import { eventSchema, EVENT_TITLE_MAX, type EventFormValues, type EventFormData } from '@/lib/validations/event';
import { createEvent, updateEvent } from '@/actions/event-actions';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES, type EventVisibility, type EventJoinModeValue } from '@/lib/constants';

type StepIndex = 0 | 1;

/** An existing event, for the edit page. Dates are ISO strings (they cross the server/client border). */
export type EventToEdit = {
    id: string;
    originalLang: TextLang;
    /** Text of every language; null when there is none yet. */
    texts: EventFormData['texts'] | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    maxParticipants: number | null;
    visibility: EventVisibility;
    joinMode: EventJoinModeValue;
    bannerImage: string | null;
};

type Props = {
    groupId: string;
    groupSlug: string;
    l1Slug: string;
    /** When set, the form edits this event instead of creating one. */
    event?: EventToEdit;
    /** Edit only: people waiting for a decision (pending + waitlisted). */
    waitingCount?: number;
};

export default function EventCreationWizard({ groupId, groupSlug, l1Slug, event, waitingCount = 0 }: Props) {
    const t = useTranslations('eventWizard');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
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
            texts: event?.texts ?? {
                lv: { title: '', description: '', instructions: '' },
                en: { title: '', description: '', instructions: '' }
            },
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

    const { register, handleSubmit, formState: { errors }, setValue, getValues, trigger } = form;
    const watched = useWatch({ control: form.control });
    const timeZone = useTimeZone();
    // Once the organiser empties the end, start changes stop filling it in again.
    const endLeftEmpty = useRef(!!event && !event.endDate);
    const startValue = String(watched.startDate ?? '');
    const endValue = String(watched.endDate ?? '');

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
    const titleError = errors.texts?.[lang]?.title;
    // Either language over the limit holds the form back, whichever one is showing.
    const titleOver = isOverLimit(watched.texts?.lv?.title, EVENT_TITLE_MAX) || isOverLimit(watched.texts?.en?.title, EVENT_TITLE_MAX);

    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) return trigger(['texts.lv.title', 'texts.en.title', 'startDate', 'endDate', 'location']);
        if (s === 1) return trigger(['visibility', 'joinMode', 'maxParticipants']);
        return true;
    }

    async function nextStep() {
        const valid = await validateStep(step);
        if (valid) setStep((s) => Math.min(s + 1, 1) as StepIndex);
    }

    function copyFromOriginal() {
        const { texts, originalLang } = form.getValues();
        setValue(`texts.${lang}`, { ...texts[originalLang] }, { shouldValidate: true });
        setRev((r) => r + 1);
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0) as StepIndex);
    }

    function save(data: EventFormData, confirmOpenWaiting: boolean) {
        setServerError(null);
        startTransition(async () => {
            const values = data as unknown as EventFormValues;
            let eventSlug: string;
            if (event) {
                const result = await updateEvent(event.id, values, locale, confirmOpenWaiting);
                if (!result.success) {
                    setServerError(result.error);
                    // Someone new started waiting since the page loaded: refresh the count and ask again.
                    if (result.error === 'CONFIRMATION_REQUIRED') router.refresh();
                    return;
                }
                eventSlug = result.data!.eventSlug;
            } else {
                const result = await createEvent(groupId, values, locale);
                if (!result.success) {
                    setServerError(result.error);
                    return;
                }
                eventSlug = result.data!.event.slug;
            }
            // Land on the event's own page.
            router.push(`/${l1Slug}/group/${groupSlug}/events/${eventSlug}`);
            router.refresh();
        });
    }

    const opensToWaiting = !!event && event.joinMode === 'REQUEST' && watched.joinMode === 'OPEN' && waitingCount > 0;

    const submitForm = handleSubmit((data) => {
        if (opensToWaiting) {
            setAskingToOpen(true);
            return;
        }
        save(data, false);
    });
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
    });

    return (
        <div
            className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lg"
        >
            {/* Progress Bar */}
            <div className="flex gap-1 rounded-t-2xl overflow-hidden">
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className={clsx('h-1 flex-1 transition-all duration-500', i <= step && 'bg-primary')}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <FormProvider {...form}>
                <form onSubmit={onSubmit} className="p-6 md:p-8">
                    {/* Step Header */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-primary">
                            {t('stepOf', { current: step + 1, total: 2 })}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-foreground">
                            {[t('step1Title'), t('step2Title')][step]}
                        </h2>
                        <p className="mt-0.5 text-sm text-foreground-muted">
                            {[t('step1Desc'), t('step2Desc')][step]}
                        </p>
                    </div>

                    <EventLangBar lang={lang} onLangChange={setLang} onCopy={copyFromOriginal} />

                    {/* Step 1: Logistics */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldName')}
                                </label>
                                <input
                                    key={`title-${lang}`}
                                    type="text"
                                    lang={lang}
                                    {...register(`texts.${lang}.title`)}
                                    aria-describedby="event-title-count"
                                    placeholder={t('fieldNamePlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        titleError ? 'border-danger/40' : 'border-border focus:border-primary'
                                    )}
                                />
                                <div className="mt-1 flex items-start gap-2">
                                    {titleError && <p className="text-xs text-danger">{t(titleError.message as 'INVALID_URL')}</p>}
                                    <TextCounter id="event-title-count" length={(watched.texts?.[lang]?.title ?? '').length} max={EVENT_TITLE_MAX} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <AlignLeft className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldDescription')}
                                </label>
                                <RichTextEditor
                                    key={`description-${lang}-${rev}`}
                                    value={watched.texts?.[lang]?.description || ''}
                                    onChange={(val) => setValue(`texts.${lang}.description`, val)}
                                    placeholder={t('fieldDescriptionPlaceholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="event-banner" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <ImageIcon className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldBannerImage')}
                                </label>
                                <input
                                    id="event-banner"
                                    type="text"
                                    {...register('bannerImage')}
                                    placeholder={t('fieldBannerImagePlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.bannerImage ? 'border-danger/40' : 'border-border focus:border-primary'
                                    )}
                                />
                                {errors.bannerImage && <p className="mt-1 text-xs text-danger">{t(errors.bannerImage.message as 'INVALID_URL')}</p>}
                            </div>

                            <div className="space-y-4">
                                <div role="group" aria-labelledby="event-start-label">
                                    <p id="event-start-label" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                        {t('fieldDate')}
                                    </p>
                                    <DateTimeField
                                        idPrefix="event-start"
                                        value={startValue}
                                        onChange={changeStart}
                                        defaultTime={splitLocal(nextFullHourLocal()).time}
                                        invalid={!!errors.startDate}
                                    />
                                    {errors.startDate && <p className="mt-1 text-xs text-danger">{t(errors.startDate.message as 'INVALID_URL')}</p>}
                                </div>

                                <div role="group" aria-labelledby="event-end-label">
                                    <p id="event-end-label" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                        {t('fieldEndDate')}
                                    </p>
                                    <DateTimeField
                                        idPrefix="event-end"
                                        value={endValue}
                                        onChange={changeEnd}
                                        defaultTime={splitLocal(addMinutesLocal(startValue, 120)).time || '12:00'}
                                        invalid={!!errors.endDate}
                                    />
                                    {errors.endDate && <p className="mt-1 text-xs text-danger">{t(errors.endDate.message as 'INVALID_URL')}</p>}
                                </div>
                                <p className="text-xs text-foreground-muted">{t('timeZoneHint', { zone: timeZone ?? '' })}</p>
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldLocation')}
                                </label>
                                <input
                                    type="text"
                                    {...register('location')}
                                    placeholder={t('fieldLocationPlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.location ? 'border-danger/40' : 'border-border focus:border-primary'
                                    )}
                                />
                                {errors.location && <p className="mt-1 text-xs text-danger">{t(errors.location.message as 'INVALID_URL')}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Permissions */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldVisibility')}
                                </label>
                                {[
                                    { val: EVENT_VISIBILITY[0], key: 'typePublic' as const, desc: 'typePublicDesc' as const },
                                    { val: EVENT_VISIBILITY[1], key: 'typeMembersOnly' as const, desc: 'typeMembersOnlyDesc' as const }
                                ].map(({ val, key, desc }) => {
                                    const isSelected = watched.visibility === val;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setValue('visibility', val as EventVisibility)}
                                            className={clsx(
                                                'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                                                isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-foreground-muted/40'
                                            )}
                                        >
                                            <span className="font-semibold">{t(key)}</span>
                                            <span className="text-xs text-foreground-muted">{t(desc)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <UserCheck className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldJoinMode')}
                                </label>
                                {[
                                    { val: EVENT_JOIN_MODES[0], key: 'joinOpen' as const, desc: 'joinOpenDesc' as const },
                                    { val: EVENT_JOIN_MODES[1], key: 'joinRequest' as const, desc: 'joinRequestDesc' as const }
                                ].map(({ val, key, desc }) => {
                                    const isSelected = watched.joinMode === val;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setValue('joinMode', val as EventJoinModeValue)}
                                            aria-pressed={isSelected}
                                            className={clsx(
                                                'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                                                isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-foreground-muted/40'
                                            )}
                                        >
                                            <span className="font-semibold">{t(key)}</span>
                                            <span className="text-xs text-foreground-muted">{t(desc)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldMaxParticipants')}
                                </label>
                                <input
                                    type="number"
                                    {...register('maxParticipants', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                                    placeholder={t('fieldMaxParticipantsPlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.maxParticipants ? 'border-danger/40' : 'border-border focus:border-primary'
                                    )}
                                />
                                <p className="mt-1 text-xs text-foreground-muted">{t('fieldMaxParticipantsHint')}</p>
                                {errors.maxParticipants && <p className="mt-1 text-xs text-danger">{t(errors.maxParticipants.message as 'MAX_PARTICIPANTS_INVALID')}</p>}
                            </div>


                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <HelpCircle className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldInstructions')}
                                </label>
                                <p className="mb-1.5 text-xs text-foreground-muted">
                                    {watched.joinMode === 'REQUEST' ? t('fieldInstructionsHintRequest') : t('fieldInstructionsHintOpen')}
                                </p>
                                <RichTextEditor
                                    key={`instructions-${lang}-${rev}`}
                                    value={watched.texts?.[lang]?.instructions || ''}
                                    onChange={(val) => setValue(`texts.${lang}.instructions`, val)}
                                    placeholder={t('fieldInstructionsPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {askingToOpen && opensToWaiting && (
                        <div role="alertdialog" aria-live="assertive" className="mt-4 space-y-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
                            <p className="text-sm font-semibold text-foreground">{t('openConfirm', { count: waitingCount })}</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => void onConfirmOpen()}
                                    disabled={isPending}
                                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                                >
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('openConfirmYes')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAskingToOpen(false)}
                                    disabled={isPending}
                                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-elevated"
                                >
                                    {t('openConfirmNo')}
                                </button>
                            </div>
                        </div>
                    )}

                    {serverError && (
                        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                            {tErrors(serverError as 'ACTION_FAILED')}
                        </p>
                    )}

                    <div className="mt-8 flex items-center gap-3">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-elevated"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('back')}
                            </button>
                        )}
                        <div className="flex-1" />
                        {/* Separate keys: React must not turn the Next button into the submit button while
                            its click is still being handled (that submitted the form from step 1). */}
                        {step < 1 ? (
                            <button
                                key="next"
                                type="button"
                                onClick={nextStep}
                                disabled={titleOver}
                                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all disabled:opacity-50"
                            >
                                {t('next')}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                key="submit"
                                type="submit"
                                disabled={isPending || askingToOpen || titleOver}
                                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all disabled:opacity-70"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {event ? t('save') : t('submit')}
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
