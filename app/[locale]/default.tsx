import { notFound } from 'next/navigation';

/**
 * `children` when the address has no page of its own. Two cases: an intercepted panel render (the client keeps the page it already
 * shows under the panel and ignores this), and an unknown address, which the `@panel/[...rest]` slot page would otherwise make look
 * like an empty page: it is a 404, as before the slot existed (default.md: "preserve the old behavior of returning a 404").
 */
export default function LocaleDefault() {
    notFound();
}
