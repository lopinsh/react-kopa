'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { UI } from '@/lib/constants';

const LABEL = { go: 'join.go', request: 'requestToJoin', waitlist: 'joinWaitlist' } as const;

/**
 * The one button that names the step ("Eju", "Pieteikties", "Pieteikties gaidīšanas sarakstā"), disabled while the step runs. The sign-in
 * gate lives in `JoinStep`, which must know whether its pop-up is open before it continues a remembered step.
 */
export default function GoingButton({ action, pending, onPress, describedBy }: { action: 'go' | 'request' | 'waitlist'; pending: boolean; onPress: () => void; describedBy?: string }) {
    const t = useTranslations('event');
    return (
        <Button data-ui={UI.goingButton} disabled={pending} aria-describedby={describedBy} onClick={onPress}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            {t(LABEL[action])}
        </Button>
    );
}
