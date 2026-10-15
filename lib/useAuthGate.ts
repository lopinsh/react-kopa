'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

// Session storage can be blocked (private windows, site settings): the gate works without remembering the action.
function readStored(key: string): string | null {
    try {
        return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStored(entries: Record<string, string | null>): void {
    try {
        for (const [key, value] of Object.entries(entries)) {
            if (value === null) window.sessionStorage.removeItem(key);
            else window.sessionStorage.setItem(key, value);
        }
    } catch {
        // Blocked storage: the pending action is simply not resumed after sign-in.
    }
}

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
                // Also store the current URL to ensure we are on the same page when we return
                if (actionKey) writeStored({ pending_auth_action: actionKey, pending_auth_url: window.location.pathname });
                setIsModalOpen(true);
            }
        },
        [session]
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const clearPendingAction = useCallback(() => {
        writeStored({ pending_auth_action: null, pending_auth_url: null });
    }, []);

    return {
        gateAction,
        isModalOpen,
        closeModal,
        isAuthenticated: !!session?.user,
        pendingAction: readStored('pending_auth_action'),
        pendingUrl: readStored('pending_auth_url'),
        clearPendingAction
    };
}
