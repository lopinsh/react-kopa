'use client';

import { useState } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { House, Pencil } from 'lucide-react';
import { relativeTo } from '@/lib/utils/relative-time';
import type { HubNoteReplyRow, HubNoteRow, NoteComposeOptions } from '@/lib/services/hub-note.service';
import AccordionRow from '@/components/hubs/AccordionRow';
import NoteActions from './NoteActions';
import NoteReplies from './NoteReplies';
import NoteForm from './NoteForm';

const DAY = 86_400_000;

/**
 * One Ziņa as an accordion row (K-79, K2-13): one line closed (the text, never bold), open the whole text, a meta line and the actions.
 * `mineList` (Manas) puts the expiry where the age stands. Signed out the author is null: no name reaches the row (K-41).
 */
export default function NoteRow({ note, edit, mineList, defaultOpen, replies, readOnly }: { note: HubNoteRow; edit?: NoteComposeOptions; mineList?: boolean; defaultOpen?: boolean; replies?: HubNoteReplyRow[]; /** The city hub's row (K3-19): text and reply count, a link to the note on its hub, nothing to write. */ readOnly?: boolean }) {
    const t = useTranslations('hub.notes');
    const tCity = useTranslations('hub.city');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const [editing, setEditing] = useState(false);
    // Replies are read the first time the row opens.
    const [opened, setOpened] = useState(!!defaultOpen);
    const age = relativeTo(format, new Date(note.createdAt), now);
    const days = Math.max(1, Math.ceil((new Date(note.expiresAt).getTime() - now.getTime()) / DAY));
    const ends = note.expired ? t('expired') : t('expiresIn', { days });

    const meta = (
        <>
            {note.author && <><span>{note.author.name}</span>{note.author.flair && <House aria-label={t('flair')} role="img" className="size-3" />}<span aria-hidden="true">·</span></>}
            <span>{age}</span>
            {!note.expired && <><span aria-hidden="true">·</span><span>{t('replies', { n: note.replyCount })}</span></>}
            {note.city && <><span aria-hidden="true">·</span><span>{note.city.name}</span></>}
            {mineList && <><span aria-hidden="true">·</span><span>{ends}</span></>}
        </>
    );

    if (readOnly) {
        return <AccordionRow id={`z-${note.id}`} icon={<Pencil />} title={note.content} when={age} meta={meta} multiline action={{ href: `${note.topic.href}?z=${note.id}`, label: tCity('openInHub') }} />;
    }

    return (
        <AccordionRow
            id={`z-${note.id}`}
            icon={<Pencil />}
            title={note.content}
            when={mineList ? ends : age}
            meta={meta}
            multiline
            defaultOpen={defaultOpen}
            onToggle={(open) => open && setOpened(true)}
        >
            {editing && edit
                ? <NoteForm options={edit} note={note} onDone={() => setEditing(false)} />
                : <><NoteReplies note={note} opened={opened} initial={replies} /><NoteActions note={note} onEdit={edit ? () => setEditing(true) : undefined} /></>}
        </AccordionRow>
    );
}
