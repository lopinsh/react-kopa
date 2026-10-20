'use client';

type Props = { hex: string; word: string; label: string; disabled: boolean; onChange: (hex: string) => void };

/** A small colour swatch with its word ("Gaišā" / "Tumšā"); the whole label is the tap target on phones. */
export default function SwatchInput({ hex, word, label, disabled, onChange }: Props) {
    return (
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-xs text-foreground-muted md:min-h-0">
            <input
                type="color"
                value={hex}
                disabled={disabled}
                aria-label={label}
                onChange={(e) => onChange(e.target.value)}
                className="h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0 ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0"
            />
            {word}
        </label>
    );
}
