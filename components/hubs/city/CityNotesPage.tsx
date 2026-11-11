import { StickyNote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { HUB_NOTE_PAGE_MAX } from '@/lib/constants';
import { CityHubService, type CityHubContext } from '@/lib/services/city-hub.service';
import { hubNoteListSchema } from '@/lib/validations/hub-note';
import EmptyState from '@/components/ui/EmptyState';
import TextLink from '@/components/ui/TextLink';
import HubTabs from '@/components/hubs/HubTabs';
import NoteRow from '@/components/hubs/notes/NoteRow';
import NoteSearch from '@/components/hubs/notes/NoteSearch';

type Search = Record<string, string | string[] | undefined>;
const BOX = 'rounded-2xl bg-surface px-4 shadow-card frame';

/**
 * Ziņas of a city hub (K3-19, K-133): every Ziņa with this city, grouped by Veids (K-111) with the search; no Manas, no Kur, nothing to write.
 * Rows open to their text and reply count and link to the note on its hub. Signed out the service returns no authors (K-41).
 */
export default async function CityNotesPage({ city, sp, locale, viewer }: { city: CityHubContext; sp: Search; locale: string; viewer?: { id: string; role?: string | null } }) {
    const query = hubNoteListSchema.parse({ q: typeof sp.q === 'string' ? sp.q : undefined });
    const [t, tCity, list, rooms] = await Promise.all([
        getTranslations({ locale, namespace: 'hub.notes' }),
        getTranslations({ locale, namespace: 'hub.city' }),
        CityHubService.notes(city, { q: query.q, take: HUB_NOTE_PAGE_MAX }, locale, viewer),
        CityHubService.rooms(city, locale),
    ]);
    const roomHref = new Map(rooms.map((r) => [r.slug, r.href]));

    return (
        <>
            <HubTabs label={t('tabsLabel')} items={[{ key: 'all', label: t('tabAll'), href: `${city.href}/messages` }]} active="all" kur={false} before={<NoteSearch className="hidden w-56 lg:block" />} />
            <div className="grid min-w-0 max-w-reading grid-cols-[minmax(0,1fr)] gap-section">
                <NoteSearch className="lg:hidden" />
                {list.rows.length === 0 ? <EmptyState icon={StickyNote} title={query.q ? t('noResults') : tCity('notesEmpty')} /> : list.sections.map((s) => (
                    <section key={s.topicSlug} className="grid grid-cols-[minmax(0,1fr)] gap-3">
                        {s.title && <h2 className="text-item weight-strong text-foreground">{roomHref.has(s.topicSlug) ? <TextLink href={roomHref.get(s.topicSlug) ?? ''}>{s.title}</TextLink> : s.title}</h2>}
                        {s.boxes.map((b) => (
                            <div key={b.group?.href ?? 'all'}>
                                <p className="mb-1 text-meta text-foreground-muted">{b.group ? b.group.name : t('forEveryone')}</p>
                                <div className={BOX}>{b.notes.map((n) => <NoteRow key={n.id} note={n} readOnly />)}</div>
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </>
    );
}
