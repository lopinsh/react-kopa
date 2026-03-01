import { Search } from 'lucide-react';

export default function DiscoveryLoading() {
    return (
        <div className="min-h-full pb-20 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="bg-surface border-b border-border py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl space-y-6">
                        <div className="h-14 w-3/4 rounded-2xl bg-surface-elevated"></div>
                        <div className="h-6 w-full rounded-xl bg-surface-elevated"></div>
                        <div className="h-6 w-5/6 rounded-xl bg-surface-elevated"></div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto mt-12 px-4">
                {/* Filters Skeleton */}
                <div className="mb-12 flex flex-col gap-4 md:flex-row">
                    <div className="h-14 flex-1 rounded-2xl bg-surface"></div>
                    <div className="h-14 w-full md:w-48 rounded-2xl bg-surface"></div>
                    <div className="h-14 w-full md:w-48 rounded-2xl bg-surface"></div>
                </div>

                {/* Results Grid Skeleton */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="h-6 w-24 rounded-full bg-surface-elevated"></div>
                                <div className="h-4 w-16 rounded-full bg-surface-elevated"></div>
                            </div>
                            <div className="h-8 w-3/4 rounded-xl bg-surface-elevated mt-2"></div>
                            <div className="space-y-2 mt-4">
                                <div className="h-4 w-full rounded-md bg-surface-elevated"></div>
                                <div className="h-4 w-5/6 rounded-md bg-surface-elevated"></div>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                                <div className="h-8 w-16 rounded-lg bg-surface-elevated"></div>
                                <div className="h-4 w-20 rounded-md bg-surface-elevated"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
