'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '@/hooks/use-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
};

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
    return (
        <div
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 pr-8 shadow-premium transition-all animate-in slide-in-from-bottom-full duration-300",
                "bg-surface/80 backdrop-blur-xl border-border/50",
                "hover:border-primary/50 hover:shadow-primary/5"
            )}
        >
            <div className="flex items-center gap-3">
                {toastIcons[toast.type]}
                <p className="text-sm font-medium text-foreground">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="absolute right-2 top-2 rounded-lg p-1 text-foreground-muted opacity-0 transition-opacity hover:bg-surface-elevated group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
