'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    /** The one toast on screen, if any. */
    toast: ToastMessage | null;
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: () => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** How long a toast stays: errors and warnings are read slower. */
const DURATION: Record<ToastType, number> = { success: 4000, info: 4000, warning: 6000, error: 6000 };

/** One toast at a time: a new one replaces the old and restarts the clock. It goes by itself, with no close button. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const counter = useRef(0);

    const removeToast = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        setToast(null);
    }, []);

    const addToast = useCallback((message: string, type: ToastType, duration = DURATION[type]) => {
        if (timer.current) clearTimeout(timer.current);
        counter.current += 1;
        setToast({ id: counter.current, message, type });
        timer.current = duration > 0 ? setTimeout(removeToast, duration) : null;
    }, [removeToast]);

    const success = useCallback((message: string, duration?: number) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message: string, duration?: number) => addToast(message, 'error', duration), [addToast]);

    const value = useMemo(() => ({ toast, addToast, removeToast, success, error }), [toast, addToast, removeToast, success, error]);

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
