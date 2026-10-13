import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'md' | 'sm';

const BASE = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-opacity disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4';

const SIZES: Record<ButtonSize, string> = {
    md: 'h-11 px-[18px] text-[15px] md:h-10',
    sm: 'h-8 px-3.5 text-sm',
};

const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-tint text-foreground hover:opacity-80',
    quiet: 'bg-transparent text-foreground ring-1 ring-inset ring-border hover:bg-tint',
    danger: 'bg-danger text-danger-foreground hover:opacity-90',
};

const NAMES: Record<ButtonVariant, string> = {
    primary: UI.buttonPrimary,
    secondary: UI.buttonSecondary,
    quiet: UI.buttonQuiet,
    danger: UI.buttonDanger,
};

/** Class string for a button-looking link (`<Link className={buttonClass('primary')}>`). */
export function buttonClass(variant: ButtonVariant = 'primary', className?: string, size: ButtonSize = 'md'): string {
    return clsx(BASE, SIZES[size], VARIANTS[variant], className);
}

/** The site's standard button (pill): one primary action in the site colour, quieter secondary and quiet, red for things that can't be undone. */
export default function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
    return <button type={type} data-ui={NAMES[variant]} className={buttonClass(variant, className, size)} {...props} />;
}
