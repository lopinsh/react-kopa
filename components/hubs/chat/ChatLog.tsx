'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ArrowDown } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { dayKey, toRuns, type ChatEntry } from './chat-lines';
import ChatLine from './ChatLine';
import { useChatLook } from './use-chat-look';

const PINNED_PX = 48;

/**
 * The lines of a room (K5-11): runs with day separators, pinned to the bottom unless the reader scrolled up (then a "new messages" pill), earlier lines load
 * when the top is reached. `onLoadMore` is absent for the signed-out read, which has only the last 50.
 */
export default function ChatLog({ entries, hasMore = false, loadingMore = false, onLoadMore }: { entries: ChatEntry[]; hasMore?: boolean; loadingMore?: boolean; onLoadMore?: () => void }) {
    const t = useTranslations('hub.chat');
    const format = useFormatter();
    const [{ compact }] = useChatLook();
    const box = useRef<HTMLDivElement>(null);
    const pinned = useRef(true);
    const before = useRef({ height: 0, first: '', last: '' });
    const [fresh, setFresh] = useState(false);

    const toBottom = useCallback(() => {
        const el = box.current;
        if (el) el.scrollTop = el.scrollHeight;
        pinned.current = true;
        setFresh(false);
    }, []);

    useLayoutEffect(() => {
        const el = box.current;
        if (!el) return;
        const first = entries[0]?.id ?? '';
        const last = entries[entries.length - 1]?.id ?? '';
        const prev = before.current;
        if (prev.first && first !== prev.first && last === prev.last) el.scrollTop += el.scrollHeight - prev.height; // earlier lines arrived above: keep the place
        else if (pinned.current) el.scrollTop = el.scrollHeight;
        else if (last !== prev.last && prev.last) setFresh(true);
        before.current = { height: el.scrollHeight, first, last };
    }, [entries]);

    const onScroll = () => {
        const el = box.current;
        if (!el) return;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_PX;
        if (pinned.current) setFresh(false);
        if (el.scrollTop < PINNED_PX && hasMore && !loadingMore && onLoadMore) onLoadMore();
    };

    const [now] = useState(() => Date.now());
    const today = dayKey(now);
    const yesterday = dayKey(now - 86_400_000);
    const label = (ts: number, day: string) => {
        const date = format.dateTime(ts, { weekday: 'short', day: 'numeric', month: 'short' });
        return day === today ? `${t('today')}, ${date}` : day === yesterday ? `${t('yesterday')}, ${date}` : date;
    };
    const runs = toRuns(entries);

    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            <div ref={box} onScroll={onScroll} role="log" aria-label={t('log')} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
                {loadingMore && <p className="pb-3 text-center text-meta text-foreground-muted">{t('loadMore')}</p>}
                {entries.length === 0 ? (
                    <p className="m-auto max-w-xs text-center text-body-sm italic text-foreground-muted">{t('empty')}</p>
                ) : (
                    <ul className={clsx('mt-auto grid list-none', compact ? 'gap-1' : 'gap-3')}>
                        {runs.map((run, i) => (
                            <li key={run.id} className="grid gap-3">
                                {(i === 0 || runs[i - 1].day !== run.day) && <p className="text-center text-tag weight-normal text-foreground-muted">{label(run.entries[0].ts, run.day)}</p>}
                                <ul className="grid list-none"><ChatLine run={run} /></ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {fresh && (
                <button type="button" onClick={toBottom} className={buttonClass('primary', 'absolute bottom-3 left-1/2 -translate-x-1/2 shadow-control', 'sm')}>
                    <ArrowDown aria-hidden className="size-3.5" />{t('newBelow')}
                </button>
            )}
        </div>
    );
}
