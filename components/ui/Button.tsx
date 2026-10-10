import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

const BASE = 'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-opacity disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'border border-border bg-surface-elevated text-foreground hover:border-primary',
    danger: 'bg-red-500 text-white hover:opacity-90',
};

const NAMES: Record<ButtonVariant, string> = {
    primary: UI.buttonPrimary,
    secondary: UI.buttonSecondary,
    danger: UI.buttonDanger,
};

/** Class string for a button-looking link (`<Link className={buttonClass('primary')}>`). */
export function buttonClass(variant: ButtonVariant = 'primary', className?: string): string {
    return clsx(BASE, VARIANTS[variant], className);
}

/** The site's standard button: one primary action, quieter secondary, red for things that can't be undone. */
export default function Button({ variant = 'primary', className, type = 'button', ...props }: ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }) {
    return <button type={type} data-ui={NAMES[variant]} className={buttonClass(variant, className)} {...props} />;
}
