import type { LucideIcon } from 'lucide-react';
import { Check, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import type { ToastMessage, ToastType } from '@/hooks/use-toast';
import { UI } from '@/lib/constants';

const ICONS: Record<ToastType, LucideIcon> = { success: Check, error: CircleAlert, warning: TriangleAlert, info: Info };

/** One line, inverted (foreground on background in both modes), no close button: it goes by itself. */
export function Toast({ toast }: { toast: ToastMessage }) {
    const Icon = ICONS[toast.type];
    return (
        <div
            data-ui={UI.toast}
            className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-premium motion-safe:animate-rise"
        >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{toast.message}</span>
        </div>
    );
}
