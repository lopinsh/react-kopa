'use client';

import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import LanguageEditor from '@/components/ui/LanguageEditor';
import WhatWhenStep from '@/components/forms/event/WhatWhenStep';
import WhoCanComeStep from '@/components/forms/event/WhoCanComeStep';
import { useEventForm } from '@/components/forms/event/useEventForm';
import { langRecord, type TextLang } from '@/lib/translations';
import { isEventTextFilled, type EventFormData } from '@/lib/validations/event';
import type { EventVisibility, EventJoinModeValue } from '@/lib/constants';

/** An existing event, for the edit page. Dates are ISO strings (they cross the server/client border). */
export type EventToEdit = {
    id: string;
    originalLang: TextLang;
    /** Text of every language; null when there is none yet. */
    texts: EventFormData['texts'] | null;
    location: string | null;
    city: string;
    isOnline: boolean;
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

/** The event form, create and edit: two steps, the owner text in every language. */
export default function EventForm({ groupId, groupSlug, l1Slug, event, waitingCount = 0 }: Props) {
    const t = useTranslations('eventWizard');
    const tErrors = useTranslations('errors');
    const f = useEventForm({ groupId, groupSlug, l1Slug, event, waitingCount });
    const { step, lang, rev, isPending, titleOver } = f;

    return (
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-surface shadow-lg">
            <div className="flex gap-1 rounded-t-2xl overflow-hidden">
                {[0, 1].map((i) => (
                    <div key={i} className={clsx('h-1 flex-1 transition-all duration-500', i <= step && 'bg-primary')} aria-hidden="true" />
                ))}
            </div>

            <FormProvider {...f.form}>
                <form onSubmit={f.onSubmit} className="p-6 md:p-8">
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-primary">{t('stepOf', { current: step + 1, total: 2 })}</p>
                        <h2 className="mt-1 text-xl font-bold text-foreground">{[t('step1Title'), t('step2Title')][step]}</h2>
                        <p className="mt-0.5 text-sm text-foreground-muted">{[t('step1Desc'), t('step2Desc')][step]}</p>
                    </div>

                    <LanguageEditor
                        lang={lang}
                        onLangChange={f.setLang}
                        originalLang={f.watched.originalLang ?? f.originalAtStart}
                        onOriginalLangChange={f.changeOriginal}
                        filled={langRecord((l) => isEventTextFilled(f.watched.texts?.[l]))}
                        errorLangs={f.langsWithErrors}
                        onCopyFromOriginal={f.copyFromOriginal}
                        onClear={f.clearText}
                        disabled={isPending}
                    >
                        {step === 0 && <WhatWhenStep lang={lang} rev={rev} onStartChange={f.changeStart} onEndChange={f.changeEnd} />}
                        {step === 1 && <WhoCanComeStep lang={lang} rev={rev} />}
                    </LanguageEditor>

                    {f.askingToOpen && f.opensToWaiting && (
                        <div role="alertdialog" aria-live="assertive" className="mt-4 space-y-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
                            <p className="text-sm font-semibold text-foreground">{t('openConfirm', { count: waitingCount })}</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => void f.onConfirmOpen()}
                                    disabled={isPending}
                                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                                >
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('openConfirmYes')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => f.setAskingToOpen(false)}
                                    disabled={isPending}
                                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-elevated"
                                >
                                    {t('openConfirmNo')}
                                </button>
                            </div>
                        </div>
                    )}

                    {f.serverError && (
                        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{tErrors(f.serverError as 'ACTION_FAILED')}</p>
                    )}

                    <div className="mt-8 flex items-center gap-3">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={f.prevStep}
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
                                onClick={f.nextStep}
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
                                disabled={isPending || f.askingToOpen || titleOver}
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
