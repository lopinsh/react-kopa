'use client';

import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import SearchInput from './SearchInput';
import SearchPanel from './SearchPanel';
import Overlay from '@/components/ui/Overlay';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearch } from '@/hooks/useSearch';
import { ICON_BUTTON } from '@/components/shell/header-styles';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import { saveRecent } from '@/lib/recent-searches';
import { SEARCH_MIN_CHARS, UI } from '@/lib/constants';

/** The search on phones (OD-20, drawing 4): the whole screen with ← and the field in a bar, the chips under it, results scrolling below. Mount = open. */
function SearchScreen() {
    const t = useTranslations('discovery.search');
    const router = useRouter();
    const pathname = usePathname();
    const page = parseDiscoveryParams(useSearchParams());
    const requestClose = useOverlayClose();
    const inputRef = useRef<HTMLInputElement>(null);
    const onDiscovery = pathname === '/';
    const search = useSearch({ active: true, initialWord: onDiscovery ? page.q : '', initialCities: onDiscovery ? page.cities : [], kind: onDiscovery ? page.kind : 'groups' });

    const onEnter = () => {
        if (search.word.trim().length < SEARCH_MIN_CHARS && !search.theme) return;
        saveRecent(search.word);
        if (search.here) requestClose();
        else router.replace(search.showAllHref, { scroll: false });
    };

    return (
        <>
            <div className="flex shrink-0 items-center gap-1.5 border-b border-border bg-surface px-2.5 py-2">
                <button type="button" aria-label={t('back')} onClick={() => requestClose()} className={ICON_BUTTON}>
                    <ChevronLeft aria-hidden />
                </button>
                <SearchInput value={search.word} onChange={(w) => search.setWord(w)} onEnter={onEnter} inputRef={inputRef} open compact autoFocus className="flex-1" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[var(--search-pb)] [--search-pb:calc(1rem+env(safe-area-inset-bottom))]">
                <SearchPanel search={search} mode="phone" inputRef={inputRef} requestClose={() => requestClose()} />
            </div>
        </>
    );
}

export default function SearchOverlay({ id, onClose }: { id: string; onClose: () => void }) {
    const t = useTranslations('discovery.search');
    return (
        <Overlay layout="screen" id={id} dataUi={UI.searchOverlay} label={t('label')} zIndexClassName="z-[60]" onClose={onClose} flush>
            <SearchScreen />
        </Overlay>
    );
}
