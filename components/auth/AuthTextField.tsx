import type { ComponentPropsWithRef } from 'react';
import { UI } from '@/lib/constants';

import { Input } from '@/components/ui/Input';
interface AuthTextFieldProps extends ComponentPropsWithRef<'input'> {
    id: string;
    label: string;
    hint?: string;
    error?: string;
}

/** Labelled input for the sign-in and register forms; shows the error in place of the hint. */
export default function AuthTextField({ id, label, hint, error, ...inputProps }: AuthTextFieldProps) {
    const note = error ?? hint;

    return (
        <div data-ui={UI.formField} className="space-y-1">
            <label htmlFor={id} className="block text-button-sm text-foreground">
                {label}
            </label>
            <Input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={note ? `${id}-note` : undefined}
                {...inputProps}
            />
            {note && (
                <p id={`${id}-note`} className={`text-meta ${error ? 'text-danger' : 'text-foreground-muted'}`}>
                    {note}
                </p>
            )}
        </div>
    );
}
