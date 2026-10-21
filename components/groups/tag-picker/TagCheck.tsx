import { Check } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
    selected: boolean;
    /** Smaller box for the topic rows under a sub-category. */
    small?: boolean;
    muted?: boolean;
};

/** The tick box at the end of every option row (the row carries the `group` class). */
export default function TagCheck({ selected, small = false, muted = false }: Props) {
    return (
        <div
            className={clsx(
                'flex items-center justify-center rounded-md border',
                small ? 'h-4 w-4' : 'h-5 w-5',
                selected
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : clsx(muted ? 'border-foreground-muted/50' : 'border-foreground-muted', 'text-transparent group-hover:border-foreground')
            )}
        >
            <Check className={small ? 'size-3 icon-stroke-strong' : 'size-3.5 icon-stroke-strong'} />
        </div>
    );
}
