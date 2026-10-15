import { SEARCH_MIN_CHARS } from '@/lib/constants';
import { foldText } from '@/lib/text-fold';

/** `text` with the first place the word occurs marked in the site colour (semibold). Marks and case are ignored; under SEARCH_MIN_CHARS letters or no match: the plain text. */
export default function Highlight({ text, word }: { text: string; word?: string }) {
    const needle = foldText((word ?? '').trim());
    if (needle.length < SEARCH_MIN_CHARS) return <>{text}</>;

    // Fold one character at a time so a match maps back to the original text (Latvian letters fold to one character each).
    let folded = '';
    const origin: number[] = [];
    for (let i = 0; i < text.length; i++) {
        const f = foldText(text[i]);
        folded += f;
        for (let k = 0; k < f.length; k++) origin.push(i);
    }
    const at = folded.indexOf(needle);
    if (at < 0) return <>{text}</>;
    const start = origin[at];
    const end = origin[at + needle.length - 1] + 1;

    return (
        <>
            {text.slice(0, start)}
            <mark className="bg-transparent font-semibold text-primary">{text.slice(start, end)}</mark>
            {text.slice(end)}
        </>
    );
}
