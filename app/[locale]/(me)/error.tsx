'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ui/ErrorState';

/** A page of this area failed to load: say so in plain words and offer a retry; the frame around it stays. */
export default function SegmentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="max-w-xl">
            <ErrorState onRetry={retry} />
        </div>
    );
}
