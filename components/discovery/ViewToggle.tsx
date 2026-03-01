'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
    currentView: 'grid' | 'list';
};

export default function ViewToggle({ currentView }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const setView = (view: 'grid' | 'list') => {
        router.push(pathname + '?' + createQueryString('view', view));
    };

    return (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 shadow-sm">
            <button
                onClick={() => setView('grid')}
                className={clsx(
                    'flex items-center justify-center rounded-md p-1.5 transition-colors',
                    currentView === 'grid' ? 'bg-surface-elevated text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
                )}
                aria-label="Grid view"
            >
                <LayoutGrid className="h-4 w-4" />
            </button>
            <button
                onClick={() => setView('list')}
                className={clsx(
                    'flex items-center justify-center rounded-md p-1.5 transition-colors',
                    currentView === 'list' ? 'bg-surface-elevated text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
                )}
                aria-label="List view"
            >
                <List className="h-4 w-4" />
            </button>
        </div>
    );
}
