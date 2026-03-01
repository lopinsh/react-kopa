import { ShieldAlert, Users } from 'lucide-react';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-12 min-h-full animate-pulse">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-muted">
                        <Users className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 w-48 rounded-md bg-surface-elevated"></div>
                        <div className="h-4 w-32 rounded-md bg-surface-elevated"></div>
                    </div>
                </div>
                <div className="h-10 w-32 rounded-xl bg-surface-elevated"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col overflow-hidden rounded-[2rem] border border-border bg-surface">
                        <div className="h-32 w-full bg-surface-elevated" />
                        <div className="flex flex-1 flex-col p-6">
                            <div className="mb-2 h-6 w-3/4 rounded bg-surface-elevated" />
                            <div className="mb-4 h-4 w-1/2 rounded bg-surface-elevated" />
                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-border">
                                <div className="h-8 w-16 rounded-full bg-surface-elevated" />
                                <div className="h-8 w-24 rounded-full bg-surface-elevated" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
