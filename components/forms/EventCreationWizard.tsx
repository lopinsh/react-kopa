'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
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

import { eventSchema, type EventFormValues, type EventFormData } from '@/lib/validations/event';
import { createEvent, updateEvent } from '@/actions/event-actions';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES, type EventVisibility, type EventJoinModeValue } from '@/lib/constants';

const STEP_SCHEMAS = [0, 1] as const;
type StepIndex = (typeof STEP_SCHEMAS)[number];

/** An existing event, for the edit page. Dates are ISO strings (they cross the server/client border). */
export type EventToEdit = {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    maxParticipants: number | null;
    visibility: EventVisibility;
    joinMode: EventJoinModeValue;
    bannerImage: string | null;
    instructions: string | null;
};

type Props = {
    groupId: string;
    groupSlug: string;
    l1Slug: string;
    /** When set, the form edits this event instead of creating one. */
    event?: EventToEdit;
};

/** Value for a datetime-local input: the browser's local time, which is how the form reads it back. */
function toLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventCreationWizard({ groupId, groupSlug, l1Slug, event }: Props) {
    const t = useTranslations('eventWizard');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const [step, setStep] = useState<StepIndex>(0);
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormData>,
        defaultValues: {
            title: event?.title ?? '',
            description: event?.description ?? '',
            location: event?.location ?? '',
            startDate: toLocalInput(event?.startDate ?? null),
            endDate: toLocalInput(event?.endDate ?? null),
            maxParticipants: event?.maxParticipants ?? undefined,
            visibility: event?.visibility ?? EVENT_VISIBILITY[0],
            joinMode: event?.joinMode ?? EVENT_JOIN_MODES[0],
            isRecurring: false,
            recurrencePattern: null,
            bannerImage: event?.bannerImage ?? '',
            instructions: event?.instructions ?? '',
        },
        mode: 'onChange',
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form;

    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) return trigger(['title', 'startDate', 'endDate', 'location']);
        if (s === 1) return trigger(['visibility', 'joinMode', 'maxParticipants']);
        return true;
    }

    async function nextStep() {
        const valid = await validateStep(step);
        if (valid) setStep((s) => Math.min(s + 1, 1) as StepIndex);
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0) as StepIndex);
    }

    const onSubmit = handleSubmit((data) => {
        setServerError(null);
        startTransition(async () => {
            const values = data as unknown as EventFormValues;
            let eventSlug: string;
            if (event) {
                const result = await updateEvent(event.id, values, locale);
                if (!result.success) {
                    setServerError(result.error);
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
                        className={clsx('h-1 flex-1 transition-all duration-500', i <= step && 'bg-[var(--accent)]')}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <FormProvider {...form}>
                <form onSubmit={onSubmit} className="p-6 md:p-8">
                    {/* Step Header */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                            {t('stepOf', { current: step + 1, total: 2 })}
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-foreground">
                            {[t('step1Title'), t('step2Title')][step]}
                        </h2>
                        <p className="mt-0.5 text-sm text-foreground-muted">
                            {[t('step1Desc'), t('step2Desc')][step]}
                        </p>
                    </div>

                    {/* Step 1: Logistics */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldName')}
                                </label>
                                <input
                                    type="text"
                                    {...register('title')}
                                    placeholder={t('fieldNamePlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.title ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{t(errors.title.message as 'INVALID_URL')}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <AlignLeft className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldDescription')}
                                </label>
                                <RichTextEditor
                                    value={watch('description') || ''}
                                    onChange={(val) => setValue('description', val)}
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
                                        errors.bannerImage ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                {errors.bannerImage && <p className="mt-1 text-xs text-red-500">{t(errors.bannerImage.message as 'INVALID_URL')}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                        {t('fieldDate')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('startDate')}
                                        className={clsx(
                                            'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                            errors.startDate ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                        )}
                                    />
                                    {errors.startDate && <p className="mt-1 text-xs text-red-500">{t(errors.startDate.message as 'INVALID_URL')}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                        {t('fieldEndDate')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('endDate')}
                                        className={clsx(
                                            'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                            errors.endDate ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                        )}
                                    />
                                    {errors.endDate && <p className="mt-1 text-xs text-red-500">{t(errors.endDate.message as 'INVALID_URL')}</p>}
                                </div>
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
                                        errors.location ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                {errors.location && <p className="mt-1 text-xs text-red-500">{t(errors.location.message as 'INVALID_URL')}</p>}
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
                                    const isSelected = watch('visibility') === val;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setValue('visibility', val as EventVisibility)}
                                            className={clsx(
                                                'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                                                isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm' : 'border-border hover:border-foreground-muted/40'
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
                                    const isSelected = watch('joinMode') === val;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setValue('joinMode', val as EventJoinModeValue)}
                                            aria-pressed={isSelected}
                                            className={clsx(
                                                'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                                                isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm' : 'border-border hover:border-foreground-muted/40'
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
                                        errors.maxParticipants ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                <p className="mt-1 text-xs text-foreground-muted">{t('fieldMaxParticipantsHint')}</p>
                                {errors.maxParticipants && <p className="mt-1 text-xs text-red-500">{t(errors.maxParticipants.message as 'MAX_PARTICIPANTS_INVALID')}</p>}
                            </div>


                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <HelpCircle className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldInstructions')}
                                </label>
                                <p className="mb-1.5 text-xs text-foreground-muted">
                                    {watch('joinMode') === 'REQUEST' ? t('fieldInstructionsHintRequest') : t('fieldInstructionsHintOpen')}
                                </p>
                                <RichTextEditor
                                    value={watch('instructions') || ''}
                                    onChange={(val) => setValue('instructions', val)}
                                    placeholder={t('fieldInstructionsPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {serverError && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
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
                        {step < 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-sm transition-all"
                            >
                                {t('next')}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-sm transition-all disabled:opacity-70"
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
