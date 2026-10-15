'use client';

import { useRef, type ReactNode } from 'react';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import AlsoMatchesLine from '@/components/discovery/filter/AlsoMatchesLine';
import SearchPanel from '@/components/search/SearchPanel';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import { categoryColor } from '@/lib/theme/category';
import type { GroupCardData } from '@/lib/services/group-card';
import type { EventRowData } from '@/lib/services/event-row';
import type { SearchModel } from '@/hooks/useSearch';
import type { SearchResults } from '@/lib/types/search';

const NOOP = () => undefined;
const GAMES = categoryColor('games');
const SPORTS = categoryColor('sports');

/** The search's state with no fetching (a stub `useSearch`): the panel renders whatever it is given. */
function stub(word: string, theme: string | null, results: SearchResults): SearchModel {
    return {
        word, setWord: NOOP, theme, toggleTheme: NOOP, cities: results.cities, setCities: NOOP, results,
        loading: false, error: false, showAllHref: '/?q=sp', here: false, reset: NOOP
    };
}

function Frame({ children }: { children: ReactNode }) {
    return <div className="w-full max-w-[600px] rounded-2xl border border-border bg-surface px-3.5 pb-3 shadow-premium">{children}</div>;
}

function Panel({ search, recent }: { search: SearchModel; recent?: string[] }) {
    const inputRef = useRef<HTMLInputElement>(null);
    return <Frame><SearchPanel search={search} mode="desktop" inputRef={inputRef} requestClose={NOOP} recentSample={recent} /></Frame>;
}

/** The search panel as static samples: "sp" typed, "Spēles" chosen, an empty field with recent searches; and the "Atbilst arī:" line of discovery. */
export function SearchDemo({ groups, event }: { groups: GroupCardData[]; event: EventRowData }) {
    const places = { cities: [{ slug: 'Jelgava', name: 'Jelgava' }, { slug: 'Riga', name: 'Rīga' }], byCity: { Jelgava: 3, Riga: 11 }, anyPlace: 17 };
    const themes = [
        { slug: 'games', title: 'Spēles', color: GAMES, count: 3 },
        { slug: 'sports', title: 'Sports un fitness', color: SPORTS, count: 6 }
    ];
    const typed: SearchResults = { word: 'sp', theme: null, cities: ['Jelgava'], themes, groups, events: [event], total: { groups: 2, events: 1 }, elsewhere: 14, places };
    const chosen: SearchResults = { ...typed, theme: 'games', word: 'vak', groups: groups.slice(0, 1), total: { groups: 1, events: 1 } };
    const idle: SearchResults = { ...typed, word: '', groups: [], events: [], total: { groups: 0, events: 0 }, elsewhere: 0, cities: [] };
    const matches = [
        { kind: 'theme' as const, slug: 'games', l1Slug: 'games', title: 'Spēles', color: GAMES, count: 3 },
        { kind: 'theme' as const, slug: 'sports', l1Slug: 'sports', title: 'Sports un fitness', color: SPORTS, count: 6 },
        { kind: 'veids' as const, slug: 'boardgames', l1Slug: 'games', title: 'Galda spēles', color: GAMES, count: 2 },
        { kind: 'veids' as const, slug: 'rpg', l1Slug: 'games', title: 'Lomu spēles', color: GAMES, count: 1 }
    ];
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start gap-6">
                <Panel search={stub('sp', null, typed)} />
                <Panel search={stub('vak', 'games', chosen)} />
                <Panel search={stub('', null, idle)} recent={['sp', 'galda spēles', 'jelgava']} />
            </div>
            <DiscoveryProvider state={{ kind: 'groups', params: parseDiscoveryParams({ q: 'sp' }), categories: [], veidi: [], counts: { total: 0, anyTopic: 0, anyPlace: 0, byCity: {}, online: 0 }, alsoMatches: matches }}>
                <div className="max-w-2xl"><AlsoMatchesLine /></div>
            </DiscoveryProvider>
        </div>
    );
}
