import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { ErrorCode } from '@/types/actions';
import { isSiteAdmin } from './moderation.service';
import { saveMessageOverrideSchema, validateMessage } from '@/lib/validations/message-override';
import { stripMarkers, type MessageTree } from '@/lib/translate-mode/marker';
import {
    MESSAGE_LANGS,
    flattenMessages,
    nestMessages,
    type MessageLang,
} from '@/lib/translate-mode/messages';

export const MESSAGE_OVERRIDES_TAG = 'message-overrides';

type OverrideMap = Record<MessageLang, Record<string, string>>;

export interface TranslationEntry {
    key: string;
    lv: string;
    en: string;
    /** Shipped text (messages/*.json), what validation compares against. */
    source: Record<MessageLang, string>;
    edited: Record<MessageLang, boolean>;
}

export interface TranslationSearchHit {
    key: string;
    lv: string;
    en: string;
}

export type OverrideResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

const flatCache = new WeakMap<MessageTree, Record<string, string>>();

/** The module cache keeps this cheap, and a dev edit of messages/*.json is picked up by hot reload. */
async function loadBase(lang: MessageLang): Promise<MessageTree> {
    return (await import(`../../messages/${lang}.json`)).default as MessageTree;
}

async function loadFlatBase(lang: MessageLang): Promise<Record<string, string>> {
    const tree = await loadBase(lang);
    let flat = flatCache.get(tree);
    if (!flat) {
        flat = flattenMessages(tree);
        flatCache.set(tree, flat);
    }
    return flat;
}

/** Only the small override rows are cached (and tagged); the merge itself is cheap. Plain text only, never marked. */
const loadOverrides = unstable_cache(
    async (): Promise<OverrideMap> => {
        const rows = await prisma.messageOverride.findMany({ select: { key: true, lang: true, value: true } });
        const map: OverrideMap = { lv: {}, en: {} };
        for (const row of rows) {
            if (row.lang === 'lv' || row.lang === 'en') map[row.lang][row.key] = row.value;
        }
        return map;
    },
    ['message-overrides'],
    // Saves expire the tag at once; the short timer only covers changes made outside the app (e.g. clearing rows in the database).
    { tags: [MESSAGE_OVERRIDES_TAG], revalidate: 60 }
);

/** Copy-on-write: clones only the branches that hold an override. */
function applyOverrides(base: MessageTree, overrides: Record<string, string>): MessageTree {
    const entries = Object.entries(overrides);
    if (entries.length === 0) return base;
    const root: MessageTree = { ...base };
    for (const [key, value] of entries) {
        const parts = key.split('.');
        let node = root;
        let ok = true;
        for (const part of parts.slice(0, -1)) {
            const next = node[part];
            if (typeof next !== 'object') { ok = false; break; }
            const copy = { ...next };
            node[part] = copy;
            node = copy;
        }
        const last = parts[parts.length - 1];
        if (ok && typeof node[last] === 'string') node[last] = value;
    }
    return root;
}

export const MessageOverrideService = {
    /** The shipped messages with admin edits laid over them. Plain text, safe to share between requests. */
    async getMergedMessages(lang: MessageLang): Promise<MessageTree> {
        const base = await loadBase(lang);
        try {
            const overrides = await loadOverrides();
            return applyOverrides(base, overrides[lang]);
        } catch (error) {
            // Edits are a layer on top: if they can't be read, the shipped texts still render (failures aren't cached).
            console.error('[MessageOverrideService.getMergedMessages] overrides unavailable:', error);
            return base;
        }
    },

    async getEntry(adminId: string, key: string): Promise<OverrideResult<TranslationEntry>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const [lvBase, enBase, overrides] = await Promise.all([loadFlatBase('lv'), loadFlatBase('en'), loadOverrides()]);
        if (!(key in lvBase) && !(key in enBase)) return { success: false, error: 'MESSAGE_KEY_UNKNOWN' };
        return {
            success: true,
            data: {
                key,
                lv: overrides.lv[key] ?? lvBase[key] ?? '',
                en: overrides.en[key] ?? enBase[key] ?? '',
                source: { lv: lvBase[key] ?? '', en: enBase[key] ?? '' },
                edited: { lv: key in overrides.lv, en: key in overrides.en },
            },
        };
    },

    /** Finds texts by key or content in either language (also the ones that can't be clicked on the page). */
    async search(adminId: string, query: string): Promise<OverrideResult<TranslationSearchHit[]>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const needle = query.trim().toLowerCase();
        if (needle.length < 2) return { success: true, data: [] };

        const [lvBase, enBase, overrides] = await Promise.all([loadFlatBase('lv'), loadFlatBase('en'), loadOverrides()]);
        const keys = new Set([...Object.keys(enBase), ...Object.keys(lvBase)]);
        const hits: TranslationSearchHit[] = [];
        for (const key of keys) {
            const lv = overrides.lv[key] ?? lvBase[key] ?? '';
            const en = overrides.en[key] ?? enBase[key] ?? '';
            if (key.toLowerCase().includes(needle) || lv.toLowerCase().includes(needle) || en.toLowerCase().includes(needle)) {
                hits.push({ key, lv, en });
                if (hits.length >= 40) break;
            }
        }
        return { success: true, data: hits };
    },

    /** Saves both languages of one key. A value equal to the shipped text removes its override. */
    async saveEntry(adminId: string, input: unknown): Promise<OverrideResult> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

        const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
        const parsed = saveMessageOverrideSchema.safeParse({
            key: raw.key,
            lv: typeof raw.lv === 'string' ? stripMarkers(raw.lv) : raw.lv,
            en: typeof raw.en === 'string' ? stripMarkers(raw.en) : raw.en,
        });
        if (!parsed.success) return { success: false, error: 'MESSAGE_INVALID' };
        const { key } = parsed.data;

        const [lvBase, enBase] = await Promise.all([loadFlatBase('lv'), loadFlatBase('en')]);
        const bases: Record<MessageLang, Record<string, string>> = { lv: lvBase, en: enBase };
        if (!(key in lvBase) && !(key in enBase)) return { success: false, error: 'MESSAGE_KEY_UNKNOWN' };

        for (const lang of MESSAGE_LANGS) {
            if (validateMessage(parsed.data[lang], bases[lang][key])) return { success: false, error: 'MESSAGE_INVALID' };
        }

        await prisma.$transaction(
            MESSAGE_LANGS.map((lang) => {
                const value = parsed.data[lang];
                if (value === bases[lang][key]) {
                    return prisma.messageOverride.deleteMany({ where: { key, lang } });
                }
                return prisma.messageOverride.upsert({
                    where: { key_lang: { key, lang } },
                    create: { key, lang, value, updatedById: adminId },
                    update: { value, updatedById: adminId },
                });
            })
        );
        return { success: true };
    },

    async listOverrides(adminId: string): Promise<OverrideResult<{ key: string; lang: string; value: string; updatedAt: Date; updatedBy: string | null }[]>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const rows = await prisma.messageOverride.findMany({
            orderBy: [{ key: 'asc' }, { lang: 'asc' }],
            include: { updatedBy: { select: { name: true } } },
        });
        return {
            success: true,
            data: rows.map((r) => ({ key: r.key, lang: r.lang, value: r.value, updatedAt: r.updatedAt, updatedBy: r.updatedBy?.name ?? null })),
        };
    },

    /** All overrides in the nested messages structure: `{ lv: {...}, en: {...} }`, ready to merge into messages/*.json. */
    async exportNested(adminId: string): Promise<OverrideResult<Record<MessageLang, MessageTree>>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const overrides = await loadOverrides();
        return { success: true, data: { lv: nestMessages(overrides.lv), en: nestMessages(overrides.en) } };
    },
};
