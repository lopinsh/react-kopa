import type { ComponentProps } from 'react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

/** The look of a text link, for an `<a>` that must be a document load (a full page, cmv9amjft). */
export const TEXT_LINK_CLASS = 'text-button-sm text-primary underline decoration-border underline-offset-4 hover:decoration-primary';

/** A plain text link in the site colour (AR-54: "Rādīt nākamo nedēļu"): 14 px semibold, underline in the border colour. */
export default function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
    return (
        <Link
            data-ui={UI.textLink}
            {...props}
            className={clsx(TEXT_LINK_CLASS, className)}
        />
    );
}
