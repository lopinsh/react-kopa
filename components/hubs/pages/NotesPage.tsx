import { StickyNote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { HUB_NOTE_ACTIVE_MAX, HUB_NOTE_PAGE_MAX } from '@/lib/constants';
import { hubPages } from '@/lib/hub-pages';
import { HubNoteService } from '@/lib/services/hub-note.service';
import type { HubContext } from '@/lib/services/hub.service';
import { hubNoteListSchema } from '@/lib/validations/hub-note';
import EmptyState from '@/components/ui/EmptyState';
import HubTabs from '@/components/hubs/HubTabs';
import NoteCompose from '@/components/hubs/notes/NoteCompose';
import NoteRow from '@/components/hubs/notes/NoteRow';
import NoteSearch from '@/components/hubs/notes/NoteSearch';
import NotesRail from '@/components/hubs/notes/NotesRail';

type Search = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined);

/**
 * Ziņas of a hub (K2-10..16): tabs Visas / Manas (signed out: Visas only) with search and Kur at the end from 1024 px, "Rakstīt ziņu" above the list, the notes
 * grouped by sub-veids and group in framed boxes (K-111), the hint line; from `xl` a side column. Signed out the service returns no authors (K-41).
 * Replies and the private request join the open row with K2-3.
 */
export default async function NotesPage({ hub, sp, cities, locale, viewer }: { hub: HubContext; sp: Search; cities: string[]; locale: string; viewer?: { id: string; role?: string | null } }) {
    const query = hubNoteListSchema.parse({ tab: first(sp.tab), q: first(sp.q), z: first(sp.z) });
    const tab = viewer ? query.tab : 'all';
    const t = await getTranslations({ locale, namespace: 'hub.notes' });
    const [list, options] = await Promise.all([
        HubNoteService.list(hub, { cities, q: query.q, tab, take: HUB_NOTE_PAGE_MAX }, locale, viewer),
        viewer ? HubNoteService.composeOptions(hub, viewer.id, locale) : null,
    ]);

    const base = hubPages(hub.href, cities).find((p) => p.key === 'messages')?.href ?? `${hub.href}/messages`;
    const withQuery = (extra: Record<string, string>) => {
        const [path, qs = ''] = base.split('?');
        const p = new URLSearchParams(qs);
        if (query.q) p.set('q', query.q);
        Object.entries(extra).forEach(([k, v]) => p.set(k, v));
        const s = p.toString().replace(/%2C/g, ',');
        return s ? `${path}?${s}` : path;
    };
    const tabs = [
        { key: 'all', label: t('tabAll'), href: withQuery({}) },
        ...(viewer ? [{ key: 'mine', label: t('tabMine'), href: withQuery({ tab: 'mine' }) }] : []),
    ];
    const gone = !!query.z && !query.q && cities.length === 0 && !list.rows.some((r) => r.id === query.z);
    const compose = <NoteCompose options={options} mineHref={withQuery({ tab: 'mine' })} startOpen={first(sp.compose) === '1'} />;
    const rowOf = (n: (typeof list.rows)[number], mineList?: boolean) => (
        <NoteRow key={n.id} note={n} edit={n.mine && options ? options : undefined} mineList={mineList} defaultOpen={n.id === query.z} />
    );
    const BOX = 'rounded-2xl bg-surface px-4 shadow-card frame';

    return (
        <>
            <HubTabs label={t('tabsLabel')} items={tabs} active={tab} before={<NoteSearch className="hidden w-56 lg:block" />} />
            <div className="grid items-start gap-section xl:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                <div className="grid min-w-0 max-w-reading grid-cols-[minmax(0,1fr)] gap-section">
                    <NoteSearch className="lg:hidden" />
                    {gone && <p className="text-body-sm text-foreground-muted">{t('gone')}</p>}
                    {tab === 'mine' ? (
                        <section aria-label={t('tabMine')} className="grid grid-cols-[minmax(0,1fr)] gap-3">
                            {options && <p className="text-meta text-foreground-muted">{t('activeCount', { n: options.activeCount, max: HUB_NOTE_ACTIVE_MAX })}</p>}
                            {list.rows.length === 0 ? <EmptyState icon={StickyNote} title={query.q ? t('noResults') : t('emptyMine')} /> : <div className={BOX}>{list.rows.map((n) => rowOf(n, true))}</div>}
                        </section>
                    ) : list.rows.length === 0 ? (
                        <EmptyState icon={StickyNote} title={query.q ? t('noResults') : t('empty')} action={query.q ? undefined : compose} />
                    ) : (
                        <>
                            {compose}
                            {list.sections.map((s) => (
                                <section key={s.topicSlug} className="grid grid-cols-[minmax(0,1fr)] gap-3">
                                    {s.title && <h2 className="text-item weight-strong text-foreground">{s.title}</h2>}
                                    {s.boxes.map((b) => (
                                        <div key={b.group?.href ?? 'all'}>
                                            <p className="mb-1 text-meta text-foreground-muted">
                                                {!b.group ? t('forEveryone') : viewer ? <Link href={b.group.href} className="underline underline-offset-2 hover:text-foreground">{b.group.name}</Link> : b.group.name}
                                            </p>
                                            <div className={BOX}>{b.notes.map((n) => rowOf(n))}</div>
                                        </div>
                                    ))}
                                </section>
                            ))}
                            <p className="text-meta text-foreground-muted">{t('hint')}</p>
                        </>
                    )}
                </div>
                <NotesRail hub={hub} cities={cities} locale={locale} viewerId={viewer?.id} />
            </div>
        </>
    );
}
