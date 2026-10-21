import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    /** `md` for desktop headers, `sm` for phones. */
    size?: 'md' | 'sm';
    /** Only the two circles (favicon-like uses). */
    iconOnly?: boolean;
    className?: string;
};

/** Two overlapping circles: the second one is the site colour at 45 %, offset to the right (AR-03). */
function Circles({ size }: { size: 'md' | 'sm' }) {
    return (
        <span
            aria-hidden="true"
            className={clsx(
                // ui-allow: the logo dot is a circle by design
                'inline-block shrink-0 rounded-full bg-primary',
                size === 'md'
                    ? 'ml-1.5 mr-2 h-3 w-3 shadow-[8px_0_0_0_color-mix(in_srgb,var(--primary)_45%,transparent)]'
                    : 'ml-1 mr-2 h-2.5 w-2.5 shadow-[7px_0_0_0_color-mix(in_srgb,var(--primary)_45%,transparent)]'
            )}
        />
    );
}

/** The Ejam kopā wordmark with its two circles. The wordmark text comes from `common.logo.wordmark`. */
export default function Logo({ size = 'md', iconOnly = false, className }: Props) {
    const t = useTranslations('common');
    return (
        <span
            data-ui={UI.logo}
            className={clsx(
                'inline-flex items-center whitespace-nowrap font-heading weight-strong text-primary',
                size === 'md' ? 'text-section' : 'text-item',
                className
            )}
        >
            {/* One inline box: as flex items, "Ejam " and <em> would lose the space between them. */}
            {!iconOnly && <span>{t.rich('logo.wordmark', { em: (chunks) => <em className="weight-medium">{chunks}</em> })}</span>}
            <Circles size={size} />
        </span>
    );
}
