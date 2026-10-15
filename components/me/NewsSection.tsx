import NewsItemRow from './NewsItem';
import type { NewsItem } from '@/lib/types/own-area';

/** Jaunumi: your groups' announcements of the last 30 days and the answers to your requests, newest first. */
export default function NewsSection({ items }: { items: NewsItem[] }) {
    const now = new Date();
    return (
        <ul className="grid gap-px rounded-2xl bg-surface px-3.5">
            {items.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="border-t border-border py-3 first:border-t-0">
                    <NewsItemRow item={item} now={now} />
                </li>
            ))}
        </ul>
    );
}
