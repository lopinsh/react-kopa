import type { ComponentProps, ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'md' | 'sm';

const BASE = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-pill disabled:opacity-50 [&_svg]:size-4';

const SIZES: Record<ButtonSize, string> = {
    md: 'h-11 px-4 text-button md:h-10',
    sm: 'h-8 px-4 text-button-sm',
};

const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'frame shadow-control press bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'frame shadow-control press bg-tint text-foreground hover:opacity-80',
    quiet: 'line shadow-control press bg-transparent text-foreground hover:bg-tint',
    danger: 'frame shadow-control press bg-danger text-danger-foreground hover:opacity-90',
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

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonVariant = ButtonVariant | 'ghost' | 'overlay' | 'accent';

const ICON_BASE = 'relative inline-flex shrink-0 items-center justify-center rounded-pill outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50';

const ICON_SIZES: Record<IconButtonSize, string> = {
    xs: 'size-5 after:absolute after:-inset-2',
    sm: 'size-7 after:absolute after:-inset-1',
    md: 'size-10',
    lg: 'size-11',
};

const ICON_VARIANTS: Record<IconButtonVariant, string> = {
    ...VARIANTS,
    ghost: 'text-foreground-muted hover:bg-tint hover:text-foreground',
    overlay: 'frame bg-surface text-foreground shadow-premium hover:bg-tint',
    accent: 'border border-border bg-surface text-foreground-muted hover:bg-tint active:scale-95', // the group chip (groupChip in groups/frame/chip)
};

/** Class string for a round icon-only control that is not a <button> (a Link, a menu trigger). */
export function iconButtonClass(variant: IconButtonVariant = 'ghost', size: IconButtonSize = 'md', className?: string): string {
    return clsx(ICON_BASE, ICON_SIZES[size], ICON_VARIANTS[variant], className);
}

/** Round icon-only button; the label is required (it is the only text a screen reader gets). Put the icon inside, sized with size-N. */
export function IconButton({ variant = 'ghost', size = 'md', className, type = 'button', 'aria-label': label, ...props }: Omit<ComponentProps<'button'>, 'aria-label'> & { 'aria-label': string; variant?: IconButtonVariant; size?: IconButtonSize }) {
    return <button type={type} aria-label={label} data-ui={UI.iconButton} className={iconButtonClass(variant, size, className)} {...props} />;
}
