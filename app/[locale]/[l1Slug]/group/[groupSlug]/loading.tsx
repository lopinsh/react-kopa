import { Calendar, MessageSquare, Users, Image as ImageIcon } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-full pb-20 bg-surface-elevated/30 animate-pulse">
            <div className="h-48 w-full bg-surface-elevated md:h-64" />
            <main className="container mx-auto -mt-16 px-4 pb-20 sm:-mt-24 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-1 items-end gap-6">
                        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[2rem] border-4 border-surface bg-surface-elevated shadow-xl sm:h-40 sm:w-40" />
                        <div className="flex-1 pb-4 space-y-2">
                            <div className="h-10 w-3/4 rounded-xl bg-surface-elevated"></div>
                            <div className="h-5 w-1/2 rounded-md bg-surface-elevated"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-12 lg:flex-row">
                    <div className="w-full lg:w-1/3 xl:w-1/4 space-y-8">
                        <div className="rounded-3xl border border-border bg-surface p-6">
                            <div className="h-6 w-1/2 rounded bg-surface-elevated mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-full rounded bg-surface-elevated"></div>
                                <div className="h-4 w-5/6 rounded bg-surface-elevated"></div>
                                <div className="h-4 w-4/6 rounded bg-surface-elevated"></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-2xl border border-border bg-surface p-6 h-48"></div>
                            <div className="rounded-2xl border border-border bg-surface p-6 h-48"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
