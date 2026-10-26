'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ImageOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { searchUnsplash } from '@/actions/unsplash-actions';
import PhotoTile from '@/components/forms/banner/PhotoTile';
import type { UnsplashPick } from '@/lib/banner';

const MAX_PAGE = 3;

type Props = { selectedUrl: string | null; onPick: (photo: UnsplashPick) => void };

/** Unsplash search inside the picker. Searches on submit only (the request limit), newest submit wins. */
export default function UnsplashSearch({ selectedUrl, onPick }: Props) {
    const t = useTranslations('banner');
    const te = useTranslations('errors');
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<UnsplashPick[] | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const current = useRef('');

    const run = (q: string, nextPage: number) => {
        current.current = q;
        startTransition(async () => {
            const res = await searchUnsplash({ query: q, page: nextPage });
            if (current.current !== q) return; // a newer submit is in flight
            if (!res.success || !res.data) {
                setError(res.success ? 'SEARCH_UNAVAILABLE' : res.error);
                return;
            }
            const { photos: found, hasMore: more } = res.data;
            setError(null);
            setPage(nextPage);
            setHasMore(more && nextPage < MAX_PAGE);
            setPhotos((prev) => (nextPage === 1 || !prev ? found : [...prev, ...found]));
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (q.length >= 2 && !isPending) run(q, 1);
    };

    return (
        <div className="space-y-3">
            <form onSubmit={submit} className="flex gap-2" role="search">
                <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchHeading')} maxLength={60} enterKeyHint="search" />
                <Button type="submit" disabled={isPending || query.trim().length < 2}>{t('searchButton')}</Button>
            </form>
            {error && <p role="alert" className="text-meta text-foreground-muted">{te(error as 'SEARCH_UNAVAILABLE')}</p>}
            {!error && photos?.length === 0 && <EmptyState icon={ImageOff} title={t('empty')} headingLevel="h3" className="pb-2 pt-2" />}
            {!error && photos && photos.length > 0 && (
                <>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {photos.map((p) => (
                            <PhotoTile key={p.id} thumb={p.thumb} alt={p.alt} label={p.credit.name} selected={selectedUrl === p.url} disabled={isPending} onPick={() => onPick(p)} />
                        ))}
                    </div>
                    {hasMore && <Button variant="quiet" size="sm" disabled={isPending} onClick={() => run(current.current, page + 1)}>{t('more')}</Button>}
                </>
            )}
        </div>
    );
}
