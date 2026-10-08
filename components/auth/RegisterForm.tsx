'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { registerUser } from '@/actions/auth';
import { registerSchema, type RegisterInput, type RegisterValues } from '@/lib/validations/auth';
import { usernameFromName } from '@/lib/username';
import UsernameField from './UsernameField';
import AuthTextField from './AuthTextField';
import { useUsernameAvailability } from './useUsernameAvailability';

interface RegisterFormProps {
    /** Safe same-origin path to continue to after sign-up. */
    callbackUrl: string;
}

export default function RegisterForm({ callbackUrl }: RegisterFormProps) {
    const t = useTranslations('auth.register');
    const tv = useTranslations('auth.validation');
    const tErrors = useTranslations('errors');
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    // The username follows the name until the user edits it by hand.
    const [usernameEdited, setUsernameEdited] = useState(false);
    const { status: usernameStatus, suggestion, check: checkUsername } = useUsernameAvailability();

    const form = useForm<RegisterInput, unknown, RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', username: '', email: '', password: '', confirmPassword: '' },
    });
    const { register, handleSubmit, setValue, setError, control, formState: { errors } } = form;
    const usernameValue = useWatch({ control, name: 'username' });

    const setUsername = (value: string) => {
        setValue('username', value);
        checkUsername(value);
    };

    const nameField = register('name');

    // An auto-generated handle that's taken is swapped for the free numbered variant.
    useEffect(() => {
        if (!usernameEdited && usernameStatus === 'taken' && suggestion) {
            setValue('username', suggestion);
            checkUsername(suggestion);
        }
    }, [usernameEdited, usernameStatus, suggestion, setValue, checkUsername]);

    const fieldError = (message?: string) => (message ? tv(message) : undefined);

    const onSubmit = (values: RegisterValues) => {
        if (isPending || usernameStatus !== 'available') return;
        setServerError(null);

        startTransition(async () => {
            const result = await registerUser(values);
            if (!result.success) {
                if (result.error === 'EMAIL_TAKEN') {
                    setError('email', { message: 'EMAIL_TAKEN' });
                } else if (result.error === 'USERNAME_TAKEN') {
                    checkUsername(values.username);
                } else {
                    setServerError(tErrors(result.error));
                }
                return;
            }

            const res = await signIn('credentials', {
                email: values.email,
                password: values.password,
                redirect: false,
            });
            if (!res || res.error) {
                setServerError(t('autoSignInFailed'));
                return;
            }
            // Full navigation so server components pick up the new session.
            window.location.assign(callbackUrl);
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <AuthTextField
                id="name"
                label={t('name')}
                hint={t('nameHint')}
                placeholder={t('namePlaceholder')}
                autoComplete="name"
                error={fieldError(errors.name?.message)}
                {...nameField}
                onChange={(e) => {
                    void nameField.onChange(e);
                    if (!usernameEdited) setUsername(usernameFromName(e.target.value));
                }}
            />

            <UsernameField
                id="username"
                value={usernameValue}
                status={usernameStatus}
                suggestion={suggestion}
                onChange={(value) => {
                    setUsernameEdited(true);
                    setUsername(value);
                }}
                disabled={isPending}
            />

            <AuthTextField
                id="email"
                type="email"
                label={t('email')}
                placeholder="you@example.com"
                autoComplete="email"
                error={fieldError(errors.email?.message)}
                {...register('email')}
            />

            <AuthTextField
                id="password"
                type="password"
                label={t('password')}
                hint={t('passwordHint')}
                autoComplete="new-password"
                error={fieldError(errors.password?.message)}
                {...register('password')}
            />

            <AuthTextField
                id="confirmPassword"
                type="password"
                label={t('confirmPassword')}
                autoComplete="new-password"
                error={fieldError(errors.confirmPassword?.message)}
                {...register('confirmPassword')}
            />

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? t('submitting') : t('submit')}
            </button>
        </form>
    );
}
