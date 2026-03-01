'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';

export default function GlobalSearch() {
    const [isMac, setIsMac] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div
                className="group relative flex h-10 items-center justify-center rounded-xl bg-surface-elevated/50 border border-border/40 text-foreground-muted transition-all duration-200 hover:bg-surface-elevated hover:border-border/60 cursor-pointer w-10 sm:w-full sm:px-4 active:scale-95"
                onClick={() => setIsModalOpen(true)}
            >
                <Search className="h-4.5 w-4.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />

                <span className="hidden sm:inline-block truncate opacity-50 group-hover:opacity-70 text-sm ml-2">
                    Find groups, events...
                </span>

                <div className="hidden sm:block flex-1 min-w-[4px]" />

                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
                </kbd>
            </div>

            <SearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
