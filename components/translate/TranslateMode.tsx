'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Languages, Pencil, Search } from 'lucide-react';
import { stripMarkers } from '@/lib/translate-mode/marker';
import { useMarkedText } from './useMarkedText';
import TranslationEditor from './TranslationEditor';
import TranslateSearch from './TranslateSearch';
import TranslateModeToggle from './TranslateModeToggle';

/**
 * Everything translation mode adds to a page. Mounted by the locale layout only when the server has
 * verified a site admin with the mode switched on, so other visitors never load any of this.
 */
export default function TranslateMode() {
    const t = useTranslations('translateMode');
    const { target, keepTarget, releaseTarget } = useMarkedText();
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);

    // The page title is not clickable text; keep the markers out of the browser tab (find it with the search instead).
    useEffect(() => {
        const clean = () => {
            const stripped = stripMarkers(document.title);
            if (stripped !== document.title) document.title = stripped;
        };
        clean();
        // Next may swap the whole <title> element, so watch the head rather than the element.
        const observer = new MutationObserver(clean);
        observer.observe(document.head, { childList: true, characterData: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div data-translate-ignore>
            {target && !editingKey && (
                <button
                    type="button"
                    aria-label={t('editTitle')}
                    title={target.key}
                    onMouseEnter={keepTarget}
                    onMouseLeave={releaseTarget}
                    onClick={() => { setEditingKey(target.key); releaseTarget(); }}
                    style={{ left: target.x - 6, top: target.y - 14 }}
                    className="fixed z-[60] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-premium transition-transform hover:scale-110"
                >
                    <Pencil className="h-3 w-3" />
                </button>
            )}

            <div className="fixed bottom-20 left-3 z-[60] md:left-auto md:right-4 flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-xs font-semibold text-foreground shadow-premium md:bottom-4">
                <Languages className="h-4 w-4 text-primary" />
                <span className="mr-1">{t('barLabel')}</span>
                <button type="button" onClick={() => setSearchOpen((o) => !o)} aria-label={t('searchButton')} title={t('searchButton')} className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-elevated">
                    <Search className="h-4 w-4" />
                </button>
                <TranslateModeToggle compact className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-surface-elevated" />
            </div>

            {searchOpen && <TranslateSearch onClose={() => setSearchOpen(false)} onPick={(key) => { setSearchOpen(false); setEditingKey(key); }} />}
            {editingKey && <TranslationEditor messageKey={editingKey} onClose={() => setEditingKey(null)} />}
        </div>
    );
}
