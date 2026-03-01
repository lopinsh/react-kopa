'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

import { eventSchema, type EventFormValues, type EventFormData } from '@/lib/validations/event';
import { createEvent } from '@/actions/event-actions';

const STEP_SCHEMAS = [0, 1] as const;
type StepIndex = (typeof STEP_SCHEMAS)[number];

type Props = {
    groupId: string;
    groupSlug: string;
    l1Slug: string;
    accentColor?: string;
};

export default function EventCreationWizard({ groupId, groupSlug, l1Slug, accentColor = '#6366f1' }: Props) {
    const t = useTranslations('eventWizard');
    const locale = useLocale();
    const router = useRouter();
    const [step, setStep] = useState<StepIndex>(0);
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as any,
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            location: '',
            startDate: '',
            endDate: '',
            maxParticipants: undefined,
            visibility: 'PUBLIC',
            isRecurring: false,
            recurrencePattern: '',
            bannerImage: '',
            instructions: '',
        },
        mode: 'onChange',
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form;

    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) return trigger(['title', 'slug', 'startDate', 'endDate', 'location']);
        if (s === 1) return trigger(['visibility', 'maxParticipants']);
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
            const result = await createEvent(groupId, data as any, locale);
            if (!result.success) {
                setServerError(result.error);
            } else {
                // Soft redirect back to group page to unmount the modal smoothly
                router.push(`/${l1Slug}/group/${groupSlug}`);
                router.refresh();
            }
        });
    });

    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

    return (
        <div
            className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lg"
            style={accentStyle}
        >
            {/* Progress Bar */}
            <div className="flex gap-1 rounded-t-2xl overflow-hidden">
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 transition-all duration-500"
                        style={{ backgroundColor: i <= step ? accentColor : undefined }}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <FormProvider {...form}>
                <form onSubmit={onSubmit} className="p-6 md:p-8">
                    {/* Step Header */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
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
                                    onBlur={(e) => {
                                        if (!watch('slug')) {
                                            const generated = e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, '-')
                                                .replace(/^-+|-+$/g, '');
                                            setValue('slug', generated, { shouldValidate: true });
                                        }
                                    }}
                                    placeholder={t('fieldNamePlaceholder')}
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.title ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                                    URL Slug
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-foreground-muted">/events/</span>
                                    <input
                                        type="text"
                                        {...register('slug')}
                                        placeholder="event-slug"
                                        className={clsx(
                                            'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                            errors.slug ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                        )}
                                    />
                                </div>
                                {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
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
                                    Banner Image URL
                                </label>
                                <input
                                    id="event-banner"
                                    type="text"
                                    {...register('bannerImage')}
                                    placeholder="https://images.unsplash.com/..."
                                    className={clsx(
                                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                        errors.bannerImage ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                    )}
                                />
                                {errors.bannerImage && <p className="mt-1 text-xs text-red-500">{errors.bannerImage.message}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <HelpCircle className="h-3.5 w-3.5 text-foreground-muted" />
                                    Special Instructions
                                </label>
                                <RichTextEditor
                                    value={watch('instructions') || ''}
                                    onChange={(val) => setValue('instructions', val)}
                                    placeholder="e.g. Find us near the big oak tree, knock thrice, etc."
                                />
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
                                    {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('endDate')}
                                        className={clsx(
                                            'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                                            errors.endDate ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                                        )}
                                    />
                                    {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
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
                                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
                            </div>

                            <div className="pt-2">
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:bg-surface-elevated/50">
                                    <input
                                        type="checkbox"
                                        {...register('isRecurring')}
                                        className="h-4 w-4 rounded border-border text-[var(--accent)] focus:ring-[var(--accent)]"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">Recurring Event</span>
                                        <span className="text-xs text-foreground-muted">This event happens on a regular basis</span>
                                    </div>
                                </label>
                            </div>

                            {watch('isRecurring') && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Loader2 className="h-3.5 w-3.5 text-foreground-muted" />
                                        Recurrence Pattern
                                    </label>
                                    <input
                                        type="text"
                                        {...register('recurrencePattern')}
                                        placeholder="e.g. Every second Tuesday at 19:00"
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Permissions */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldMaxParticipants')}
                                </label>
                                <input
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                    placeholder={t('fieldMaxParticipantsPlaceholder')}
                                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                    <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                                    {t('fieldVisibility')}
                                </label>
                                {[
                                    { val: 'PUBLIC', key: 'typePublic', desc: 'typePublicDesc' },
                                    { val: 'MEMBERS_ONLY', key: 'typeMembersOnly', desc: 'typeMembersOnlyDesc' }
                                ].map(({ val, key, desc }) => {
                                    const isSelected = watch('visibility') === val;
                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setValue('visibility', val as any)}
                                            className={clsx(
                                                'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                                                isSelected ? 'shadow-sm' : 'border-border hover:border-foreground-muted/40'
                                            )}
                                            style={isSelected ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : undefined}
                                        >
                                            <span className="font-semibold">{t(key as any)}</span>
                                            <span className="text-xs text-foreground-muted">{t(desc as any)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {serverError && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {serverError}
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
                                className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
                                style={{ backgroundColor: accentColor }}
                            >
                                {t('next')}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-70"
                                style={{ backgroundColor: accentColor }}
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('submit')}
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
