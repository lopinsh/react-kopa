'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { stripMarkers } from '@/lib/translate-mode/marker';
import { useMarkedText } from './useMarkedText';

/**
 * Everything the Tulkot tab adds to the page: the underlines, the hover pencil (it selects the key in the tab)
 * and the clean browser-tab title. Mounted only inside the panel, which the server shows to verified site admins.
 */
export default function TranslateMode({ onSelect }: { onSelect: (key: string) => void }) {
    const t = useTranslations('translateMode');
    const { target, keepTarget, releaseTarget } = useMarkedText();

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

    if (!target) return null;
    return (
        <button
            type="button"
            data-translate-ignore
            aria-label={t('editTitle')}
            title={target.key}
            onMouseEnter={keepTarget}
            onMouseLeave={releaseTarget}
            onClick={() => { onSelect(target.key); releaseTarget(); }}
            style={{ left: target.x - 6, top: target.y - 14 }}
            className="fixed z-[57] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-premium transition-transform hover:scale-110"
        >
            <Pencil className="size-3" />
        </button>
    );
}
