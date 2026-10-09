import { z } from 'zod';
import { parse, TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

/** What went wrong with an edited message. */
export type MessageIssue =
    | { code: 'ICU_SYNTAX' }
    | { code: 'PLACEHOLDER_MISMATCH'; detail: string }
    | { code: 'ARM_MISSING'; detail: string };

interface ArgShape {
    type: string;
    arms: Set<string>;
}

interface MessageShape {
    args: Map<string, ArgShape>;
    tags: Set<string>;
}

function collect(elements: MessageFormatElement[], shape: MessageShape): void {
    for (const el of elements) {
        switch (el.type) {
            case TYPE.argument:
            case TYPE.number:
            case TYPE.date:
            case TYPE.time:
                if (!shape.args.has(el.value)) shape.args.set(el.value, { type: String(el.type), arms: new Set() });
                break;
            case TYPE.select:
            case TYPE.plural: {
                const arg = shape.args.get(el.value) ?? { type: String(el.type), arms: new Set<string>() };
                shape.args.set(el.value, arg);
                for (const [arm, option] of Object.entries(el.options)) {
                    arg.arms.add(arm);
                    collect(option.value, shape);
                }
                break;
            }
            case TYPE.tag:
                shape.tags.add(el.value);
                collect(el.children, shape);
                break;
            default:
                break;
        }
    }
}

/** Parses an ICU message with the same rules the runtime uses; null when it is not valid. */
export function describeMessage(message: string): MessageShape | null {
    try {
        const shape: MessageShape = { args: new Map(), tags: new Set() };
        collect(parse(message), shape);
        return shape;
    } catch {
        return null;
    }
}

/**
 * Checks an edited message: valid ICU syntax, and the same placeholders, plural/select arms and tags
 * as the source text it replaces (the shipped text in messages/<lang>.json). Null when fine.
 */
export function validateMessage(value: string, source: string | undefined): MessageIssue | null {
    const next = describeMessage(value);
    if (!next) return { code: 'ICU_SYNTAX' };
    if (source === undefined) return null;
    const original = describeMessage(source);
    if (!original) return null;

    for (const [name, arg] of original.args) {
        const edited = next.args.get(name);
        if (!edited || edited.type !== arg.type) return { code: 'PLACEHOLDER_MISMATCH', detail: `{${name}}` };
        for (const arm of arg.arms) {
            if (!edited.arms.has(arm)) return { code: 'ARM_MISSING', detail: `${name}: ${arm}` };
        }
    }
    for (const name of next.args.keys()) {
        if (!original.args.has(name)) return { code: 'PLACEHOLDER_MISMATCH', detail: `{${name}}` };
    }
    for (const tag of original.tags) {
        if (!next.tags.has(tag)) return { code: 'PLACEHOLDER_MISMATCH', detail: `<${tag}>` };
    }
    for (const tag of next.tags) {
        if (!original.tags.has(tag)) return { code: 'PLACEHOLDER_MISMATCH', detail: `<${tag}>` };
    }
    return null;
}

const messageValueSchema = z
    .string()
    .min(1, 'MESSAGE_INVALID')
    .max(2000, 'MESSAGE_INVALID')
    .refine((v) => describeMessage(v) !== null, 'MESSAGE_INVALID');

export const saveMessageOverrideSchema = z.object({
    key: z.string().min(1).max(200).regex(/^[A-Za-z0-9_.-]+$/),
    lv: messageValueSchema,
    en: messageValueSchema,
});

export type SaveMessageOverrideValues = z.infer<typeof saveMessageOverrideSchema>;
