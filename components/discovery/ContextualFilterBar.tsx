'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';

import type { ContextualTaxonomy } from '@/lib/types/discovery';

type Props = {
    taxonomy: ContextualTaxonomy | null;
    locale: string;
};

export default function ContextualFilterBar({ taxonomy, locale }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations('discovery');

    // Manage dropdown state
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            return newParams.toString();
        },
        [searchParams]
    );

    const handleCategorySelect = (categorySlug: string) => {
        router.push(`${pathname}?${createQueryString({ cat: categorySlug })}`);
        setOpenDropdown(null);
    };

    const handleClearHierarchy = () => {
        router.push(`${pathname}?${createQueryString({ cat: null })}`);
    };

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!taxonomy) return null;

    const { l1, l2s, activeHierarchy } = taxonomy;
    const accentColor = l1.color || '#6366f1';

    // Find active L2 id if applicable
    const activeL2Node = activeHierarchy.find(h => h.level === 2);
    const activeL2Id = activeL2Node?.id;

    // Find active L3 id if applicable
    const activeL3Node = activeHierarchy.find(h => h.level === 3);
    const activeL3Id = activeL3Node?.id;

    return (
        <div className="mb-6 flex flex-col gap-4">
            {/* Contextual Sub-category Bar (L2 Chips) */}
            {l2s.length > 0 && (
                <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade pb-2" ref={dropdownRef}>

                    {/* Reset/All Chip for current L1 */}
                    <button
                        onClick={() => handleCategorySelect(l1.slug)}
                        style={{
                            backgroundColor: !activeL2Id ? `${accentColor}` : 'transparent',
                            color: !activeL2Id ? '#fff' : 'inherit',
                            borderColor: !activeL2Id ? 'transparent' : 'var(--border)',
                        }}
                        className={clsx(
                            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all soft-press",
                            activeL2Id && "text-foreground hover:border-foreground"
                        )}
                    >
                        All {l1.title}
                    </button>

                    {l2s.map((l2) => {
                        const isActiveL2 = activeL2Id === l2.id;
                        const hasChildren = l2.children && l2.children.length > 0;
                        const isOpen = openDropdown === l2.id;

                        return (
                            <div key={l2.id} className="relative shrink-0">
                                <button
                                    onClick={() => {
                                        if (hasChildren) {
                                            if (isOpen) {
                                                setOpenDropdown(null);
                                            } else {
                                                setOpenDropdown(l2.id);
                                            }
                                        } else {
                                            handleCategorySelect(l2.slug);
                                        }
                                    }}
                                    style={{
                                        backgroundColor: isActiveL2 ? `${accentColor}1A` : 'transparent',
                                        color: isActiveL2 ? accentColor : 'inherit',
                                        borderColor: isActiveL2 ? accentColor : 'var(--border)',
                                    }}
                                    className={clsx(
                                        "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all soft-press",
                                        !isActiveL2 && "text-foreground hover:border-foreground"
                                    )}
                                >
                                    <span>{l2.title}</span>
                                    {hasChildren && (
                                        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                                    )}
                                </button>

                                {/* Dropdown Menu (L3 Drilldown) */}
                                {hasChildren && isOpen && (
                                    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                                        <button
                                            onClick={() => handleCategorySelect(l2.slug)}
                                            className={clsx(
                                                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated flex items-center justify-between",
                                                !activeL3Id && isActiveL2 ? "font-bold text-[var(--accent)]" : "text-foreground font-medium"
                                            )}
                                            style={{ ['--accent' as string]: accentColor }}
                                        >
                                            Any {l2.title}
                                        </button>
                                        <div className="my-1 h-px w-full bg-border" />
                                        <div className="flex max-h-60 flex-col overflow-y-auto">
                                            {l2.children.map(l3 => {
                                                const isActiveL3 = activeL3Id === l3.id;
                                                return (
                                                    <button
                                                        key={l3.id}
                                                        onClick={() => handleCategorySelect(l3.slug)}
                                                        className={clsx(
                                                            "rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated",
                                                            isActiveL3 ? "font-bold text-[var(--accent)]" : "text-foreground"
                                                        )}
                                                        style={{ ['--accent' as string]: accentColor }}
                                                    >
                                                        {l3.title}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
