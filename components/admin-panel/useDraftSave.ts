'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { savePreviewTheme } from '@/actions/theme-actions';
import { useToast } from '@/hooks/use-toast';
import type { ThemeInput, ThemeType } from '@/lib/validations/theme';

const SAVE_DELAY_MS = 400;

/**
 * Dizains tab: type edits go into the admin's draft theme after a short pause, then the page refreshes so the server
 * renders the new type variables (nothing is written client-side). One save in flight; a newer value waits and saves once more.
 */
export function useDraftSave(server: ThemeInput) {
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { error: toastError } = useToast();
    const [theme, setTheme] = useState(server);
    const [busy, setBusy] = useState(false);
    const [saves, setSaves] = useState(0);
    const [prevServer, setPrevServer] = useState(server);
    // Take the server's theme again (publish, discard) only when no step is pending, so a refresh never undoes an edit.
    if (prevServer !== server) {
        setPrevServer(server);
        if (!busy && JSON.stringify(server) !== JSON.stringify(theme)) setTheme(server);
    }

    const latest = useRef(server);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlight = useRef(false);
    const again = useRef(false);

    const flush = useCallback(async () => {
        if (inFlight.current) { again.current = true; return; }
        inFlight.current = true;
        try {
            do {
                again.current = false;
                const res = await savePreviewTheme(latest.current);
                if (res.success) {
                    setSaves((n) => n + 1);
                    router.refresh();
                } else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            } while (again.current);
        } finally {
            inFlight.current = false;
            setBusy(false);
        }
    }, [router, tErrors, toastError]);

    const editType = useCallback((type: ThemeType | undefined) => {
        const next = { ...latest.current, type };
        latest.current = next;
        setTheme(next);
        setBusy(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    }, [flush]);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    return { theme, busy, saves, editType };
}
