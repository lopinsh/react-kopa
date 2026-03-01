'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, ListFilter, Users, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { getCategoryIcon } from '@/lib/icons';

type Category = {
    id: string;
    slug: string;
    title: string;
    color: string;
};

type Props = {
    categories: Category[];
    cities: string[];
    locale: string;
    activeCategoryId?: string;
};



export default function TopFilterBar({ categories, cities, locale, activeCategoryId }: Props) {
    const t = useTranslations('discovery');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const currentCity = searchParams.get('city') || 'all';
    const currentCategory = activeCategoryId || searchParams.get('cat') || '';
    const currentType = searchParams.get('type') || 'all';

    // For dropdown state of subcategories
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20); // Quick trigger
        };
        window.addEventListener('scroll', handleScroll);
        // initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === 'all') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });

            return newParams.toString();
        },
        [searchParams]
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`${pathname}?${createQueryString({ q: query })}`);
    };

    const handleCityChange = (city: string) => {
        router.push(`${pathname}?${createQueryString({ city })}`);
    };

    const handleTypeChange = (type: string) => {
        router.push(`${pathname}?${createQueryString({ type })}`);
    };

    const handleCategoryClick = (catSlug: string) => {
        if (currentCategory === catSlug) {
            setOpenDropdown(openDropdown === catSlug ? null : catSlug);
        } else {
            router.push(`${pathname}?${createQueryString({ cat: catSlug })}`);
            setOpenDropdown(catSlug);
        }
    };

    return (
        <div className={clsx(
            "sticky top-[--header-height] z-40 w-full bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out border-b border-border shadow-sm",
            isScrolled ? "py-3" : "pt-6 pb-4"
        )}>
            <div className="container mx-auto px-4 flex flex-col gap-4">

                {/* L1 Categories - Horizontal Scroll */}
                <div className="flex w-full items-center gap-6 overflow-x-auto no-scrollbar mask-linear-fade pr-12">
                    <button
                        onClick={() => { router.push(`${pathname}?${createQueryString({ cat: null })}`); setOpenDropdown(null); }}
                        className={clsx(
                            "shrink-0 flex items-center gap-2 pb-2 border-b-2 transition-all soft-press",
                            !currentCategory ? "border-foreground text-foreground" : "border-transparent text-foreground-muted hover:border-border hover:text-foreground"
                        )}
                    >
                        <ListFilter className="h-4 w-4" />
                        <span className="text-sm font-bold">All</span>
                    </button>
                    {categories.map((cat) => {
                        const isActive = currentCategory === cat.slug;
                        const CatIcon = getCategoryIcon(cat.slug);
                        return (
                            <div key={cat.id} className="relative shrink-0 flex flex-col items-center">
                                <button
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    style={{
                                        borderColor: isActive ? cat.color : undefined,
                                        color: isActive ? cat.color : undefined,
                                    }}
                                    className={clsx(
                                        "shrink-0 flex items-center gap-2 pb-2 border-b-2 transition-all soft-press",
                                        isActive ? "border-[color:inherit]" : "border-transparent text-foreground-muted hover:border-border hover:text-foreground"
                                    )}
                                >
                                    <CatIcon className="h-4 w-4" />
                                    <span className="text-sm font-bold">{cat.title}</span>
                                    {isActive && <ChevronDown className={clsx("h-3 w-3 transition-transform", openDropdown === cat.slug && "rotate-180")} />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Dropdown / Subcategories Row (Renders just under categories) */}
                <div className={clsx(
                    "transition-all duration-300 overflow-hidden",
                    openDropdown ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                )}>
                    {openDropdown && (
                        <div className="flex flex-wrap gap-2 pb-2">
                            <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider mr-2 self-center">Categories:</span>
                            {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setOpenDropdown(null)}
                                    className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-bold text-foreground hover:border-foreground/30 hover:bg-surface-elevated transition-all soft-press"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Composite Search Bar (Airbnb Pill Style) */}
                <div className={clsx(
                    "flex flex-col sm:flex-row items-center transition-all duration-300 origin-top bg-surface border border-border sm:rounded-full rounded-2xl shadow-sm hover:shadow-md",
                    isScrolled ? "mx-0 w-full sm:max-w-2xl h-14" : "mx-0 w-full sm:max-w-3xl h-16"
                )}>
                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative flex-1 w-full h-full flex items-center border-b sm:border-b-0 sm:border-r border-border">
                        <div className="pl-6 pr-2 h-full w-full flex flex-col justify-center">
                            {!isScrolled && <span className="text-[10px] uppercase font-black tracking-wider text-foreground-muted mb-0.5">Search</span>}
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search groups, events..."
                                className={clsx(
                                    "w-full bg-transparent border-none p-0 focus:ring-0 text-foreground placeholder:text-foreground-muted transition-all",
                                    isScrolled ? "text-sm font-semibold h-5" : "text-base font-bold h-6"
                                )}
                            />
                        </div>
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); router.push(`${pathname}?${createQueryString({ q: null })}`); }}
                                className="mr-4 shrink-0 rounded-full bg-border hover:bg-foreground/10 p-1 text-foreground-muted transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </form>

                    {/* City Select */}
                    <div className="relative flex-1 w-full h-full sm:max-w-[240px] flex items-center">
                        <div className="pl-6 w-full h-full flex flex-col justify-center cursor-pointer">
                            {!isScrolled && <span className="text-[10px] uppercase font-black tracking-wider text-foreground-muted mb-0.5">Location</span>}
                            <select
                                value={currentCity}
                                onChange={(e) => handleCityChange(e.target.value)}
                                className={clsx(
                                    "w-full appearance-none bg-transparent border-none p-0 focus:ring-0 cursor-pointer transition-all",
                                    isScrolled ? "text-sm font-semibold text-foreground h-5" : "text-base font-bold text-foreground h-6"
                                )}
                            >
                                <option value="all">Anywhere</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Select */}
                        <div className="pl-4 pr-2 w-full h-full flex flex-col justify-center cursor-pointer border-l border-border max-w-[140px] sm:max-w-none">
                            {!isScrolled && <span className="text-[10px] uppercase font-black tracking-wider text-foreground-muted mb-0.5">Type</span>}
                            <select
                                value={currentType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className={clsx(
                                    "w-full appearance-none bg-transparent border-none p-0 focus:ring-0 cursor-pointer transition-all",
                                    isScrolled ? "text-sm font-semibold text-foreground h-5" : "text-base font-bold text-foreground h-6"
                                )}
                            >
                                <option value="all">Any</option>
                                <option value="PUBLIC">Public</option>
                                <option value="PRIVATE">Private</option>
                                <option value="SINGLE_EVENT">Event</option>
                            </select>
                        </div>

                        <div className="shrink-0 p-2 pr-4 pl-4 border-l border-border">
                            <button onClick={handleSearch} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-white shadow-md hover:scale-105 transition-transform soft-press">
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
