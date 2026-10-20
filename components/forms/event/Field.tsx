import type { ReactNode } from 'react';
import { clsx } from 'clsx';

/** The input look of the event form: 12 px radius, 44 px tall on phones, 40 from md. */
export const FIELD_INPUT = 'block w-full h-11 rounded-xl border bg-background px-3 text-body-sm focus:outline-none md:h-10';

export function fieldBorder(invalid: boolean): string {
    return invalid ? 'border-danger/60' : 'border-border focus:border-primary';
}

type Props = {
    /** The id of the input; the help or error line is `${id}-hint` (point aria-describedby at it). */
    id: string;
    label: string;
    hint?: string;
    /** Replaces the hint, in the danger colour. */
    error?: string;
    /** A counter at the right end of the help line. */
    counter?: ReactNode;
    /** For a rich-text editor, which has no single input to label. */
    group?: boolean;
    children: ReactNode;
};

/** Handbook form field: label above (14 px, 500, no icon), the input, help text below; an error replaces the help text. */
export default function Field({ id, label, hint, error, counter, group, children }: Props) {
    const text = error ?? hint;
    return (
        <div role={group ? 'group' : undefined} aria-labelledby={group ? `${id}-label` : undefined}>
            {group ? (
                <p id={`${id}-label`} className="mb-1.5 text-body-sm text-foreground">{label}</p>
            ) : (
                <label htmlFor={id} className="mb-1.5 block text-button-sm text-foreground">{label}</label>
            )}
            {children}
            {(text || counter) && (
                <div className="mt-1 flex items-start gap-2">
                    {text && <p id={`${id}-hint`} className={clsx('flex-1 text-meta', error ? 'text-danger' : 'text-foreground-muted')}>{text}</p>}
                    {counter}
                </div>
            )}
        </div>
    );
}
