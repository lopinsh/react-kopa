'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Star, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toggleAttendance } from '@/actions/event-actions';
import { useRouter } from 'next/navigation';

type Props = {
    eventId: string;
    initialStatus: 'GOING' | 'INTERESTED' | 'NONE';
    accentColor: string;
    locale: string;
};

export default function RSVPButtons({ eventId, initialStatus, accentColor, locale }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = (newStatus: 'GOING' | 'INTERESTED') => {
        const finalStatus = status === newStatus ? 'NONE' : newStatus;

        startTransition(async () => {
            const result = await toggleAttendance(eventId, finalStatus, locale);
            if (result.success) {
                setStatus(finalStatus);
                router.refresh();
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={() => handleToggle('GOING')}
                disabled={isPending}
                className={clsx(
                    "flex items-center justify-center gap-2 rounded-2xl py-4 font-black transition-all shadow-lg active:scale-95 group relative overflow-hidden",
                    status === 'GOING'
                        ? "text-white"
                        : "bg-surface-elevated text-foreground hover:bg-white/5 border border-white/5"
                )}
                style={status === 'GOING' ? { backgroundColor: accentColor } : {}}
            >
                {isPending && status === 'GOING' && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}
                <CheckCircle2 className={clsx("h-5 w-5", status === 'GOING' ? "text-white" : "text-foreground-muted group-hover:text-foreground")} />
                I'M GOING
            </button>

            <button
                onClick={() => handleToggle('INTERESTED')}
                disabled={isPending}
                className={clsx(
                    "flex items-center justify-center gap-2 rounded-2xl py-4 font-black transition-all group relative overflow-hidden",
                    status === 'INTERESTED'
                        ? "border-2"
                        : "border-2 border-border text-foreground-muted hover:border-foreground-muted/50 hover:text-foreground"
                )}
                style={status === 'INTERESTED' ? { borderColor: accentColor, color: accentColor } : {}}
            >
                {isPending && status === 'INTERESTED' && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}
                <Star className={clsx("h-5 w-5 fill-current", status === 'INTERESTED' ? "text-[var(--accent)]" : "text-transparent stroke-foreground-muted group-hover:stroke-foreground")} />
                INTERESTED
            </button>
        </div>
    );
}
