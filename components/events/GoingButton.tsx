'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthGate } from '@/lib/useAuthGate';
import Button from '@/components/ui/Button';
import { UI } from '@/lib/constants';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

const LABEL = { go: 'join.go', request: 'requestToJoin', waitlist: 'joinWaitlist' } as const;

/**
 * The one button that names the step ("Eju", "Pieteikties", "Pieteikties gaidīšanas sarakstā"). Signed in, the step runs at once; signed out
 * the sign-in pop-up opens and the step is remembered (`event_join`): after signing in the event's own page continues it once.
 */
export default function GoingButton({ action, pending, onPress, describedBy }: { action: 'go' | 'request' | 'waitlist'; pending: boolean; onPress: () => void; describedBy?: string }) {
    const t = useTranslations('event');
    const { gateAction, isModalOpen, closeModal } = useAuthGate();
    return (
        <>
            <Button data-ui={UI.goingButton} disabled={pending} aria-describedby={describedBy} onClick={() => gateAction(onPress, 'event_join')}>
                {pending && <Loader2 aria-hidden className="animate-spin" />}
                {t(LABEL[action])}
            </Button>
            {isModalOpen && <AuthGateModal isOpen onClose={closeModal} />}
        </>
    );
}
