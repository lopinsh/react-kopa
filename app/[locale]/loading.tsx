import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-full pb-20 pt-2">
            <main className="container mx-auto px-4 max-w-7xl relative">
                <div className="w-full">
                    {/* Search Bar Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-[60px] w-full rounded-[24px]" />
                    </div>

                    {/* Header Skeleton */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>

                    {/* Filter Bar Placeholder (if any) */}
                    <div className="mb-6 flex gap-2 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
                        ))}
                    </div>

                    {/* Results Grid Skeleton */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                {/* Image Placeholder */}
                                <Skeleton className="aspect-[4/3] w-full rounded-[24px]" />
                                {/* Content Placeholder */}
                                <div className="space-y-2 px-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex justify-between items-center pt-2">
                                        <Skeleton className="h-8 w-24 rounded-full" />
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
