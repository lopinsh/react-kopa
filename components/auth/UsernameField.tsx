'use client';

import { useTranslations } from 'next-intl';
import { AtSign, CheckCircle, Loader2, XCircle } from 'lucide-react';
import type { UsernameAvailability } from './useUsernameAvailability';

interface UsernameFieldProps {
    id: string;
    value: string;
    status: UsernameAvailability;
    suggestion: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

/** `@handle` input with live availability feedback and a one-tap free alternative. */
export default function UsernameField({
    id, value, status, suggestion, onChange, disabled, autoFocus,
}: UsernameFieldProps) {
    const t = useTranslations('onboarding.username');
    const c = useTranslations('common');

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-foreground">
                {c('username')}
            </label>

            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <AtSign className="h-4 w-4 text-foreground-muted" />
                </div>
                <input
                    id={id}
                    type="text"
                    value={value}
                    // Handles are lowercase; fold as the user types instead of rejecting.
                    onChange={(e) => onChange(e.target.value.toLowerCase())}
                    placeholder={t('placeholder')}
                    // Not "username": sign-in is by email, so password managers must not save the handle as the login.
                    autoComplete="nickname"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoFocus={autoFocus}
                    maxLength={30}
                    disabled={disabled}
                    className="block w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />}
                    {status === 'available' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    {(status === 'taken' || status === 'invalid') && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
            </div>

            <div className="min-h-[1.25rem] text-xs">
                {status === 'checking' && <span className="text-foreground-muted">{t('checking')}</span>}
                {status === 'available' && <span className="font-medium text-emerald-500">{t('available')}</span>}
                {status === 'taken' && (
                    <span className="font-medium text-red-500">
                        {t('taken')}{' '}
                        {suggestion && (
                            <button
                                type="button"
                                onClick={() => onChange(suggestion)}
                                className="text-primary underline underline-offset-2 hover:opacity-80"
                            >
                                {t('useSuggestion', { suggestion })}
                            </button>
                        )}
                    </span>
                )}
                {(status === 'idle' || status === 'invalid') && (
                    <span className="text-foreground-muted">{t('hint')}</span>
                )}
            </div>
        </div>
    );
}
