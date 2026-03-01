'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MobileFilterWrapper({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('discovery');

    return (
        <>
            {/* Mobile View: Collapsed by default, FAB to open */}
            <div className="md:hidden">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-6 font-bold text-white shadow-xl shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
                    >
                        <Filter className="h-5 w-5" />
                        {t('filters')}
                    </button>
                )}

                {/* Mobile Overlay */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm transition-opacity p-4 pt-20">
                        <div className="relative flex flex-1 flex-col overflow-y-auto rounded-3xl border border-border bg-surface p-2 shadow-2xl">
                            <div className="flex justify-end p-2 pb-0">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full bg-surface-elevated p-2 text-foreground hover:bg-border transition-colors focus:outline-none"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 pb-8">
                                {children}
                            </div>
                            <div className="sticky bottom-0 border-t border-border bg-surface p-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 soft-press"
                                >
                                    {t('applyFilters')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop View: Always visible */}
            <div className="hidden md:block">
                {children}
            </div>
        </>
    );
}
