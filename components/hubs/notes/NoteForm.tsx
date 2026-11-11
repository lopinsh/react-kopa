'use client';

import { useId, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { HUB_NOTE_MAX } from '@/lib/constants';
import { hubNoteEditSchema, hubNoteSchema } from '@/lib/validations/hub-note';
import { createHubNote, editHubNote } from '@/actions/hub-note-actions';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import TextCounter from '@/components/ui/TextCounter';
import type { HubNoteRow, NoteComposeOptions } from '@/lib/services/hub-note.service';

/**
 * Compose or edit a Ziņa (K2-14): text, Veids (new notes on an L2 hub), Grupa (only the person's own groups in that Veids) and Pilsēta, both optional.
 * New: ends on the note's own page (`?z=`); edit: the same fields inside the row, the Veids fixed.
 */
export default function NoteForm({ options, hubSlug, note, onDone, onCancel }: { options: NoteComposeOptions; hubSlug?: string; note?: HubNoteRow; onDone?: () => void; onCancel?: () => void }) {
    const t = useTranslations('hub.notes');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { error: toastError } = useToast();
    const id = useId();
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState(note?.content ?? '');
    const [topic, setTopic] = useState(note?.topic.slug ?? hubSlug ?? options.topics[0]?.slug ?? '');
    const [groupId, setGroupId] = useState(note?.group?.id ?? '');
    const [citySlug, setCitySlug] = useState(note?.city?.slug ?? '');
    const groups = options.topics.find((x) => x.slug === topic)?.groups ?? [];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isPending) return;
        const group = groups.some((g) => g.id === groupId) ? groupId : null;
        const parsed = note
            ? hubNoteEditSchema.safeParse({ content, groupId: group, citySlug: citySlug || null })
            : hubNoteSchema.safeParse({ content, categorySlug: topic, groupId: group ?? undefined, citySlug: citySlug || undefined });
        if (!parsed.success) return;
        startTransition(async () => {
            const result = note ? await editHubNote(note.id, parsed.data) : await createHubNote(parsed.data);
            if (!result.success) {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                return;
            }
            if (!note && result.data && 'href' in result.data) router.push(result.data.href);
            setContent('');
            onDone?.();
        });
    };

    return (
        <form onSubmit={submit} aria-label={note ? t('edit') : t('form.formLabel')} className="mt-2 grid gap-3">
            <div>
                <label htmlFor={`${id}-text`} className="mb-1 block text-meta text-foreground-muted">{t('form.text')}</label>
                <Textarea id={`${id}-text`} rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('form.placeholder')} aria-describedby={`${id}-count`} />
                <TextCounter id={`${id}-count`} length={content.length} max={HUB_NOTE_MAX} className="mt-1" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {!note && options.topics.length > 1 && (
                    <div>
                        <label htmlFor={`${id}-topic`} className="mb-1 block text-meta text-foreground-muted">{t('form.topic')}</label>
                        <Select id={`${id}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)}>
                            {options.topics.map((x) => <option key={x.slug} value={x.slug}>{x.title}</option>)}
                        </Select>
                    </div>
                )}
                {groups.length > 0 && (
                    <div>
                        <label htmlFor={`${id}-group`} className="mb-1 block text-meta text-foreground-muted">{t('form.group')}</label>
                        <Select id={`${id}-group`} value={groups.some((g) => g.id === groupId) ? groupId : ''} onChange={(e) => setGroupId(e.target.value)}>
                            <option value="">{t('forEveryone')}</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </Select>
                    </div>
                )}
                <div>
                    <label htmlFor={`${id}-city`} className="mb-1 block text-meta text-foreground-muted">{t('form.city')}</label>
                    <Select id={`${id}-city`} value={citySlug} onChange={(e) => setCitySlug(e.target.value)}>
                        <option value="">{t('form.noCity')}</option>
                        {options.cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" size="sm" disabled={isPending || content.trim().length === 0 || content.length > HUB_NOTE_MAX}>{note ? t('form.save') : t('form.publish')}</Button>
                <Button size="sm" variant="quiet" disabled={isPending} onClick={onCancel ?? onDone}>{tCommon('cancel')}</Button>
            </div>
        </form>
    );
}
