'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

export default function DialogModal({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onDismiss}
            />
            <div
                className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onDismiss}
                    className="absolute -top-12 right-0 md:-right-12 md:top-0 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X className="h-6 w-6" />
                </button>
                {children}
            </div>
        </div>
    );
}
