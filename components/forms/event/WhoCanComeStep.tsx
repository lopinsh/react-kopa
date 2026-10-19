'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Users, HelpCircle } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ChoiceGroup from '@/components/forms/event/ChoiceGroup';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES, type EventVisibility, type EventJoinModeValue } from '@/lib/constants';
import type { EventFormData } from '@/lib/validations/event';
import type { TextLang } from '@/lib/translations';

type Props = { lang: TextLang; rev: number };

/** Step 2: who sees the event, how people join, about how many, practical info. */
export default function WhoCanComeStep({ lang, rev }: Props) {
    const t = useTranslations('eventWizard');
    const { register, setValue, control, formState: { errors } } = useFormContext<EventFormData>();
    const visibility = useWatch({ control, name: 'visibility' });
    const joinMode = useWatch({ control, name: 'joinMode' });
    const instructions = useWatch({ control, name: `texts.${lang}.instructions` });

    return (
        <div className="space-y-6">
            <ChoiceGroup<EventVisibility>
                label={t('fieldVisibility')}
                value={visibility}
                onChange={(v) => setValue('visibility', v)}
                options={[
                    { value: EVENT_VISIBILITY[0], title: t('typePublic'), description: t('typePublicDesc') },
                    { value: EVENT_VISIBILITY[1], title: t('typeMembersOnly'), description: t('typeMembersOnlyDesc') },
                ]}
            />
            <ChoiceGroup<EventJoinModeValue>
                label={t('fieldJoinMode')}
                value={joinMode}
                onChange={(v) => setValue('joinMode', v)}
                options={[
                    { value: EVENT_JOIN_MODES[0], title: t('joinOpen'), description: t('joinOpenDesc') },
                    { value: EVENT_JOIN_MODES[1], title: t('joinRequest'), description: t('joinRequestDesc') },
                ]}
            />

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
                    {joinMode === 'REQUEST' ? t('fieldInstructionsHintRequest') : t('fieldInstructionsHintOpen')}
                </p>
                <div lang={lang}>
                    <RichTextEditor
                        key={`instructions-${lang}-${rev}`}
                        value={instructions || ''}
                        onChange={(val) => setValue(`texts.${lang}.instructions`, val)}
                        placeholder={t('fieldInstructionsPlaceholder')}
                    />
                </div>
            </div>
        </div>
    );
}
