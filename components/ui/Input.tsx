import type { ComponentPropsWithRef } from 'react';
import { clsx } from 'clsx';

/**
 * The site's text controls. One look for Input, Select and Textarea: the `line` edge on a surface,
 * 40 px tall (44 on phones), and a primary focus ring. Layout classes (width, margin, flex) go in `className`;
 * colour, radius and edge stay here so a look changes every field. A field in error: `aria-invalid`.
 */
const BASE = 'block w-full rounded-md line bg-surface px-3 text-body md:text-body-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary aria-[invalid=true]:border-danger/60 disabled:opacity-60';
const LINE = 'min-h-11 py-2 md:min-h-10';

/** Class string for the rare element that cannot be an Input (e.g. a third-party control). */
export function fieldClass(className?: string, multiline = false): string {
    return clsx(BASE, !multiline && LINE, multiline && 'py-2', className);
}

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
    return <input className={fieldClass(className)} {...props} />;
}

export function Select({ className, ...props }: ComponentPropsWithRef<'select'>) {
    return <select className={fieldClass(className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithRef<'textarea'>) {
    return <textarea className={fieldClass(className, true)} {...props} />;
}
