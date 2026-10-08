'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usernameSchema } from '@/lib/validations/onboarding';
import { checkUsernameAvailability } from '@/actions/onboarding-actions';

export type UsernameAvailability = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

/**
 * Debounced username availability check shared by registration and onboarding.
 * When the username is taken, `suggestion` holds the first free numbered variant.
 */
export function useUsernameAvailability() {
    const [status, setStatus] = useState<UsernameAvailability>('idle');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latest = useRef('');

    const check = useCallback((username: string) => {
        latest.current = username;
        if (timer.current) clearTimeout(timer.current);
        setSuggestion(null);

        if (!username) return setStatus('idle');
        if (!usernameSchema.safeParse(username).success) return setStatus('invalid');

        setStatus('checking');
        timer.current = setTimeout(async () => {
            const result = await checkUsernameAvailability(username);
            // Ignore answers for a value the user has already typed past.
            if (latest.current !== username) return;
            setStatus(result.available ? 'available' : 'taken');
            setSuggestion(result.suggestion ?? null);
        }, 300);
    }, []);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    return { status, suggestion, check };
}
