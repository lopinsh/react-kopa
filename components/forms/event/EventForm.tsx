'use client';

import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
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
        <div className="w-full max-w-[560px] rounded-2xl bg-surface shadow-card frame">
            <FormProvider {...f.form}>
                <form onSubmit={f.onSubmit} className="p-[18px] md:p-6">
                    <div className="mb-5">
                        <p className="text-[13px] text-foreground-muted">{t('stepOf', { current: step + 1, total: 2 })}</p>
                        <h2 className="mt-1 text-[21px]">{[t('step1Title'), t('step2Title')][step]}</h2>
                        <p className="mt-1 text-sm text-foreground-muted">{[t('step1Desc'), t('step2Desc')][step]}</p>
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

                    <ConfirmDialog
                        isOpen={f.askingToOpen && f.opensToWaiting}
                        title={t('openConfirmTitle')}
                        message={t('openConfirm', { count: waitingCount })}
                        confirmLabel={t('openConfirmYes')}
                        isPending={isPending}
                        onConfirm={() => void f.onConfirmOpen()}
                        onCancel={() => f.setAskingToOpen(false)}
                    />

                    {f.serverError && (
                        <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{tErrors(f.serverError as 'ACTION_FAILED')}</p>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-3">
                        {step > 0 ? (
                            <Button variant="quiet" onClick={f.prevStep} disabled={isPending}>{t('back')}</Button>
                        ) : <span />}
                        {/* Separate keys: React must not turn the Next button into the submit button while
                            its click is still being handled (that submitted the form from step 1). */}
                        {step < 1 ? (
                            <Button key="next" onClick={f.nextStep} disabled={titleOver}>{t('next')}</Button>
                        ) : (
                            <Button key="submit" type="submit" disabled={isPending || f.askingToOpen || titleOver}>
                                {isPending && <Loader2 className="animate-spin" />}
                                {event ? t('save') : t('submit')}
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
