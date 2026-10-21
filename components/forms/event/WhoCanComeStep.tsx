'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Field from '@/components/forms/event/Field';
import ChoiceGroup from '@/components/forms/event/ChoiceGroup';
import { EVENT_VISIBILITY, EVENT_JOIN_MODES, type EventVisibility, type EventJoinModeValue } from '@/lib/constants';
import type { EventFormData } from '@/lib/validations/event';
import type { TextLang } from '@/lib/translations';

import { Input } from '@/components/ui/Input';
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

            <Field
                id="event-max"
                label={t('fieldMaxParticipants')}
                hint={t('fieldMaxParticipantsHint')}
                error={errors.maxParticipants ? t(errors.maxParticipants.message as 'MAX_PARTICIPANTS_INVALID') : undefined}
            >
                <Input
                    id="event-max"
                    type="number"
                    inputMode="numeric"
                    {...register('maxParticipants', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                    placeholder={t('fieldMaxParticipantsPlaceholder')}
                    aria-invalid={errors.maxParticipants ? true : undefined}
                    aria-describedby="event-max-hint"
                />
            </Field>

            <Field
                group
                id="event-instructions"
                label={t('fieldInstructions')}
                hint={joinMode === 'REQUEST' ? t('fieldInstructionsHintRequest') : t('fieldInstructionsHintOpen')}
            >
                <div lang={lang}>
                    <RichTextEditor
                        key={`instructions-${lang}-${rev}`}
                        value={instructions || ''}
                        onChange={(val) => setValue(`texts.${lang}.instructions`, val)}
                        placeholder={t('fieldInstructionsPlaceholder')}
                    />
                </div>
            </Field>
        </div>
    );
}
