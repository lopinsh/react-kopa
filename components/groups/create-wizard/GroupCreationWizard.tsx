'use client';

import { loadFullPage } from '@/lib/full-page';
import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useForm, useWatch, FormProvider, type Resolver } from 'react-hook-form';
import { isOverLimit } from '@/lib/text-limit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

import { groupFormSchema, GROUP_NAME_MAX, GROUP_LOOKING_FOR_MAX, type GroupFormValues } from '@/lib/validations/group';
import { createGroup } from '@/actions/group-actions';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/lib/types/taxonomy';

import TaxonomyStep from '@/components/groups/create-wizard/TaxonomyStep';
import BasicInfoStep from '@/components/groups/create-wizard/BasicInfoStep';
import AccessStep from '@/components/groups/create-wizard/AccessStep';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { MAX_GROUP_TAGS, NEUTRAL_ACCENT } from '@/lib/constants';
import { categoryColor } from '@/lib/theme/category';
import { clsx } from 'clsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_COUNT = 3;
const LAST_STEP = STEP_COUNT - 1;
type StepIndex = 0 | 1 | 2;
const STEP_TITLE_KEYS = ['step1Title', 'step2Title', 'step3Title'] as const;
const STEP_DESC_KEYS = ['step1Desc', 'step2Desc', 'step3Desc'] as const;

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
    taxonomy: TaxonomyTree;
    initialL1Slug?: string;
};

export default function GroupCreationWizard({ taxonomy, initialL1Slug }: Props) {
    const t = useTranslations('wizard');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const [step, setStep] = useState<StepIndex>(0);
    const [readyStep, setReadyStep] = useState<StepIndex | null>(null);
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const containerRef = useFocusTrap<HTMLDivElement>(true);

    // Default pre-select based on URL
    const defaultTaxSelection = useMemo(() => {
        if (!initialL1Slug) return null;
        const l1 = taxonomy.find(t => t.slug === initialL1Slug || t.id === initialL1Slug);
        if (!l1) return null;
        return {
            kind: 'existing' as const,
            categoryId: l1.id,
            l1Color: categoryColor(l1.slug, l1.color),
            label: l1.title
        };
    }, [initialL1Slug, taxonomy]);

    const [accentColor, setAccentColor] = useState<string>(
        defaultTaxSelection?.kind === 'existing' ? defaultTaxSelection.l1Color : NEUTRAL_ACCENT
    );
    const [taxSelection, setTaxSelection] = useState<TaxonomySelection | null>(defaultTaxSelection);
    // Set when changing the main category removed sub-topics the person had chosen (the step tells them).
    const [tagsCleared, setTagsCleared] = useState(false);

    // Only allow submission after being on the last step for a moment to prevent auto-subs
    const canSubmit = step === LAST_STEP && readyStep === step;
    useEffect(() => {
        if (step !== LAST_STEP) return;
        const timer = setTimeout(() => setReadyStep(step), 500);
        return () => {
            clearTimeout(timer);
            setReadyStep(null);
        };
    }, [step]);

    // Accessibility: Focus title on step change
    useEffect(() => {
        titleRef.current?.focus();
    }, [step]);

    const form = useForm<GroupFormValues>({
        // The schema turns an empty "Ko meklējam?" into null, so its input and output types differ.
        resolver: zodResolver(groupFormSchema) as unknown as Resolver<GroupFormValues>,
        defaultValues: {
            categoryId: defaultTaxSelection?.kind === 'existing' ? defaultTaxSelection.categoryId : '',
            name: '',
            description: '',
            lookingFor: null,
            city: undefined,
            tagIds: [],
            type: 'PUBLIC',
            isAcceptingMembers: true,
        },
        mode: 'onChange',
    });

    const { handleSubmit, setValue, trigger } = form;

    // Sync taxonomy selection → form values
    function handleTaxChange(sel: TaxonomySelection | null) {
        const previousCategoryId = form.getValues('categoryId');
        setTaxSelection(sel);
        if (sel?.kind === 'existing') {
            setValue('categoryId', sel.categoryId, { shouldValidate: true });
            setAccentColor(sel.l1Color);
        } else {
            setValue('categoryId', '');
            setAccentColor(NEUTRAL_ACCENT);
        }
        // Sub-topics belong to one main category: a different one starts with none chosen.
        const changed = (sel?.kind === 'existing' ? sel.categoryId : '') !== previousCategoryId;
        setTagsCleared(changed && form.getValues('tagIds').length > 0);
        setValue('tagIds', []);
    }

    // Per-step field validation before advancing
    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) return trigger(['categoryId', 'tagIds', 'city']); // Taxonomy + City
        if (s === 1) return trigger(['name', 'lookingFor', 'description', 'bannerImage']); // Basic Info
        if (s === 2) return trigger(['type']); // Access
        return true;
    }

    const nameOver = isOverLimit(useWatch({ control: form.control, name: 'name' }), GROUP_NAME_MAX);
    const lookingForOver = isOverLimit(useWatch({ control: form.control, name: 'lookingFor' }), GROUP_LOOKING_FOR_MAX);
    const textOver = nameOver || lookingForOver;

    async function nextStep() {
        const valid = await validateStep(step);
        if (valid) setStep((s) => Math.min(s + 1, LAST_STEP) as StepIndex);
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0) as StepIndex);
    }

    const onSubmit = handleSubmit((data) => {
        if (step < LAST_STEP || (!canSubmit && !isPending)) {
            // Do nothing if we aren't ready to submit
            return;
        }

        setServerError(null);
        startTransition(async () => {
            const result = await createGroup(data, locale);
            if (!result.success) {
                setServerError(result.error);
            } else if (result.data?.slug && result.data?.l1Slug) {
                loadFullPage(`/${locale}/${result.data.l1Slug}/group/${result.data.slug}`);
            }
        });
    });

    // The one place the accent is set: every step below reads var(--primary).
    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

    return (
        <div
            ref={containerRef}
            className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lg"
            style={accentStyle}
        >
            {/* Progress Bar */}
            <div className="flex gap-1 rounded-t-2xl overflow-hidden">
                {Array.from({ length: STEP_COUNT }, (_, i) => (
                    <div
                        key={i}
                        className={clsx('h-1 flex-1 transition-all duration-500', i <= step && 'bg-primary')}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={(e) => {
                        if (step < LAST_STEP) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        onSubmit(e);
                    }}
                    className="p-6 md:p-8 flex flex-col min-h-[420px]"
                >
                    {/* Step Header */}
                    <div className="mb-8">
                        <p className="text-xs font-semibold text-primary">
                            {t('stepOf', { current: step + 1, total: STEP_COUNT })}
                        </p>
                        <h2
                            ref={titleRef}
                            tabIndex={-1}
                            className="mt-2 text-3xl font-semibold tracking-tight text-foreground outline-none"
                        >
                            {t(STEP_TITLE_KEYS[step])}
                        </h2>
                        <p className="mt-1.5 text-base text-foreground-muted">
                            {t(STEP_DESC_KEYS[step])}
                        </p>
                    </div>

                    <div className="flex-1">
                        {step === 0 && (
                            <TaxonomyStep
                                taxonomy={taxonomy}
                                taxSelection={taxSelection}
                                handleTaxChange={handleTaxChange}
                                tagsCleared={tagsCleared}
                            />
                        )}
                        {step === 1 && <BasicInfoStep />}
                        {step === 2 && <AccessStep />}

                        {serverError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger border border-danger/40"
                            >
                                {tErrors(serverError as 'ACTION_FAILED', { max: MAX_GROUP_TAGS })}
                            </p>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex h-12 items-center gap-1.5 rounded-xl border border-border px-6 font-medium text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground soft-press"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {c('back')}
                            </button>
                        ) : <div />}

                        {step < LAST_STEP ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={textOver}
                                className="flex h-12 items-center gap-2 rounded-full bg-primary px-8 font-bold text-primary-foreground shadow-[0_4px_14px_0_color-mix(in_srgb,var(--primary)_25%,transparent)] transition-all soft-press disabled:opacity-50"
                            >
                                {c('next')}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending || textOver}
                                className="flex h-12 items-center gap-2 rounded-full bg-primary px-8 font-bold text-primary-foreground shadow-[0_4px_14px_0_color-mix(in_srgb,var(--primary)_25%,transparent)] transition-all soft-press disabled:opacity-70 disabled:scale-100"
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

