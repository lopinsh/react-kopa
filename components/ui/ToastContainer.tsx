'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Toast } from './Toast';

// Above the 64 px bottom bar on phones (AR-19) and the cookie banner; bottom centre from md.
const REGION = 'pointer-events-none fixed inset-x-0 z-[100] flex justify-center px-4 bottom-[calc(4rem+12px+var(--cookie-banner-h,0px))] md:bottom-6';

/** Two live regions that exist before a message arrives, so a screen reader hears it: polite for news, assertive for errors. */
export function ToastContainer() {
    const { toast } = useToast();
    const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

    if (!mounted) return null;

    const isError = toast?.type === 'error';
    return createPortal(
        <>
            <div role="status" className={REGION}>{toast && !isError && <Toast key={toast.id} toast={toast} />}</div>
            <div role="alert" className={REGION}>{toast && isError && <Toast key={toast.id} toast={toast} />}</div>
        </>,
        document.body
    );
}
