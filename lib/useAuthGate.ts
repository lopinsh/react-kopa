'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

/**
 * Hook for gating actions behind authentication.
 * If the user has a session, the callback runs immediately.
 * If not, the auth modal opens instead.
 *
 * Usage:
 *   const { gateAction, isModalOpen, closeModal } = useAuthGate();
 *   <button onClick={() => gateAction(() => doSomething())}>Do It</button>
 *   <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
 */
export function useAuthGate() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const gateAction = useCallback(
        (callback: () => void, actionKey?: string) => {
            if (session?.user) {
                callback();
            } else {
                if (actionKey) {
                    sessionStorage.setItem('pending_auth_action', actionKey);
                    // Also store the current URL to ensure we are on the same page when we return
                    sessionStorage.setItem('pending_auth_url', window.location.pathname);
                }
                setIsModalOpen(true);
            }
        },
        [session]
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const clearPendingAction = useCallback(() => {
        sessionStorage.removeItem('pending_auth_action');
        sessionStorage.removeItem('pending_auth_url');
    }, []);

    return {
        gateAction,
        isModalOpen,
        closeModal,
        isAuthenticated: !!session?.user,
        pendingAction: typeof window !== 'undefined' ? sessionStorage.getItem('pending_auth_action') : null,
        pendingUrl: typeof window !== 'undefined' ? sessionStorage.getItem('pending_auth_url') : null,
        clearPendingAction
    };
}
