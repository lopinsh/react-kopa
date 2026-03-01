'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Toast } from './Toast';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed bottom-4 left-1/2 z-[100] flex w-full -translate-x-1/2 flex-col-reverse items-center gap-2 p-4 md:max-w-[420px] lg:bottom-8"
        >
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>,
        document.body
    );
}
