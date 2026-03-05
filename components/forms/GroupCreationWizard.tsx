'use client';

import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

import { groupFormSchema, type GroupFormValues } from '@/lib/validations/group';
import { createGroup } from '@/actions/group-actions';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';

import TaxonomyStep from '@/components/groups/create-wizard/TaxonomyStep';
import BasicInfoStep from '@/components/groups/create-wizard/BasicInfoStep';
import LocationStep from '@/components/groups/create-wizard/LocationStep';
import AccessStep from '@/components/groups/create-wizard/AccessStep';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_SCHEMAS = [0, 1, 2, 3] as const;
type StepIndex = (typeof STEP_SCHEMAS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
    taxonomy: TaxonomyTree;
    initialL1Slug?: string;
};

export default function GroupCreationWizard({ taxonomy, initialL1Slug }: Props) {
    const t = useTranslations('wizard');
    const locale = useLocale();
    const router = useRouter();
    const [step, setStep] = useState<StepIndex>(0);
    const [canSubmit, setCanSubmit] = useState(false);
    const [accentColor, setAccentColor] = useState('#6366f1');
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const containerRef = useFocusTrap(true);

    // Default pre-select based on URL
    const defaultTaxSelection = useMemo(() => {
        if (!initialL1Slug) return null;
        const l1 = taxonomy.find(t => t.slug === initialL1Slug || t.id === initialL1Slug);
        if (!l1) return null;
        return {
            kind: 'existing' as const,
            categoryId: l1.id,
            l1Color: l1.color,
            label: l1.title
        };
    }, [initialL1Slug, taxonomy]);

    const [taxSelection, setTaxSelection] = useState<TaxonomySelection | null>(defaultTaxSelection);

    useEffect(() => {
        if (defaultTaxSelection?.kind === 'existing') {
            setAccentColor(defaultTaxSelection.l1Color);
        }
    }, [defaultTaxSelection]);

    // Only allow submission after being on the last step for a moment to prevent auto-subs
    useEffect(() => {
        if (step === 3) {
            const timer = setTimeout(() => setCanSubmit(true), 500);
            return () => clearTimeout(timer);
        } else {
            setCanSubmit(false);
        }
    }, [step]);

    // Accessibility: Focus title on step change
    useEffect(() => {
        titleRef.current?.focus();
    }, [step]);

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupFormSchema) as any,
        defaultValues: {
            categoryId: defaultTaxSelection?.kind === 'existing' ? defaultTaxSelection.categoryId : undefined,
            name: '',
            description: '',
            city: undefined,
            wildcardLabel: undefined,
            wildcardParentId: undefined,
            tagIds: [],
            type: 'PUBLIC',
            isAcceptingMembers: true,
        },
        mode: 'onChange',
    });

    const { handleSubmit, setValue, trigger } = form;

    // Sync taxonomy selection → form values
    function handleTaxChange(sel: TaxonomySelection | null) {
        setTaxSelection(sel);
        if (sel?.kind === 'existing') {
            setValue('categoryId', sel.categoryId, { shouldValidate: true });
            setAccentColor(sel.l1Color);
        } else {
            setValue('categoryId', '' as any);
            setAccentColor('#6366f1');
        }
        // Reset sub-tags whenever L1 changes to ensure data consistency
        setValue('tagIds', []);
        setValue('wildcardLabel', undefined);
        setValue('wildcardParentId', undefined);
    }

    // Per-step field validation before advancing
    async function validateStep(s: StepIndex): Promise<boolean> {
        if (s === 0) return trigger(['categoryId', 'tagIds', 'wildcardLabel']); // Taxonomy
        if (s === 1) return trigger(['name', 'description']); // Basic Info
        if (s === 2) return trigger(['city']); // Location
        if (s === 3) return trigger(['type']); // Access
        return true;
    }

    async function nextStep() {
        const valid = await validateStep(step);
        if (valid) setStep((s) => Math.min(s + 1, 3) as StepIndex);
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0) as StepIndex);
    }

    const onSubmit = handleSubmit((data) => {
        if (step < 3 || (!canSubmit && !isPending)) {
            // Do nothing if we aren't ready to submit
            return;
        }

        setServerError(null);
        startTransition(async () => {
            const result = await createGroup(data, locale);
            if (!result.success) {
                setServerError(result.error);
            } else if (result.data?.slug && result.data?.l1Slug) {
                router.push(`/${result.data.l1Slug}/group/${result.data.slug}`);
            }
        });
    });

    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

    return (
        <div
            ref={containerRef as any}
            className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lg"
            style={accentStyle}
        >
            {/* Progress Bar */}
            <div className="flex gap-1 rounded-t-2xl overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 transition-all duration-500"
                        style={{ backgroundColor: i <= step ? accentColor : undefined }}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <FormProvider {...form}>
                <form
                    onSubmit={(e) => {
                        if (step < 3) {
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
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                            {t('stepOf', { current: step + 1, total: 4 })}
                        </p>
                        <h2
                            ref={titleRef}
                            tabIndex={-1}
                            className="mt-2 text-3xl font-black tracking-tight text-foreground outline-none"
                        >
                            {t(`step${step + 1}Title` as any)}
                        </h2>
                        <p className="mt-1.5 text-base text-foreground-muted">
                            {t(`step${step + 1}Desc` as any)}
                        </p>
                    </div>

                    <div className="flex-1">
                        {step === 0 && (
                            <TaxonomyStep
                                taxonomy={taxonomy}
                                taxSelection={taxSelection}
                                handleTaxChange={handleTaxChange}
                                accentColor={accentColor}
                            />
                        )}
                        {step === 1 && <BasicInfoStep accentColor={accentColor} />}
                        {step === 2 && <LocationStep />}
                        {step === 3 && <AccessStep accentColor={accentColor} />}

                        {serverError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400 border border-red-200"
                            >
                                {serverError}
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
                                {t('back')}
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex h-12 items-center gap-2 rounded-xl px-8 font-bold text-white shadow-lg transition-all soft-press"
                                style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
                            >
                                {t('next')}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex h-12 items-center gap-2 rounded-xl px-8 font-bold text-white shadow-lg transition-all soft-press disabled:opacity-70 disabled:scale-100"
                                style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
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
