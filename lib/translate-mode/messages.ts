import type { MessageTree } from './marker';

export type MessageLang = 'lv' | 'en';
export const MESSAGE_LANGS: readonly MessageLang[] = ['lv', 'en'];

export function isMessageLang(value: string): value is MessageLang {
    return value === 'lv' || value === 'en';
}

/** Dotted keys → text for every string in a messages tree. */
export function flattenMessages(tree: MessageTree, prefix = '', out: Record<string, string> = {}): Record<string, string> {
    for (const [name, value] of Object.entries(tree)) {
        const key = prefix ? `${prefix}.${name}` : name;
        if (typeof value === 'string') out[key] = value;
        else flattenMessages(value, key, out);
    }
    return out;
}

/** Inverse of flattenMessages. */
export function nestMessages(flat: Record<string, string>): MessageTree {
    const root: MessageTree = {};
    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split('.');
        let node = root;
        for (const part of parts.slice(0, -1)) {
            const next = node[part];
            if (typeof next === 'object') node = next;
            else {
                const created: MessageTree = {};
                node[part] = created;
                node = created;
            }
        }
        node[parts[parts.length - 1]] = value;
    }
    return root;
}
