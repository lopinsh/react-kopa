import type { ComponentPropsWithRef } from 'react';

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
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-foreground">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={note ? `${id}-note` : undefined}
                className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary aria-[invalid=true]:border-red-500"
                {...inputProps}
            />
            {note && (
                <p id={`${id}-note`} className={`text-xs ${error ? 'text-red-500' : 'text-foreground-muted'}`}>
                    {note}
                </p>
            )}
        </div>
    );
}
