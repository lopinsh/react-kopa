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
    /** A suggestion waiting for approval, per language (null when there is none). */
    pending: Record<MessageLang, string | null>;
}

export interface SuggestionRow {
    id: string;
    key: string;
    lang: MessageLang;
    current: string;
    value: string;
    createdAt: Date;
    createdBy: string | null;
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

/** Own keys only, so names like `constructor` or `__proto__` (inherited from Object) are never taken for message keys. */
function isKnownKey(key: string, ...bases: Record<string, string>[]): boolean {
    return bases.some((base) => Object.hasOwn(base, key) && typeof base[key] === 'string');
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
        if (!isKnownKey(key, lvBase, enBase)) return { success: false, error: 'MESSAGE_KEY_UNKNOWN' };
        const pendingRows = await prisma.messageSuggestion.findMany({ where: { key }, select: { lang: true, value: true } });
        const pending: Record<MessageLang, string | null> = { lv: null, en: null };
        for (const row of pendingRows) {
            if (row.lang === 'lv' || row.lang === 'en') pending[row.lang] = row.value;
        }
        return {
            success: true,
            data: {
                key,
                pending,
                lv: overrides.lv[key] ?? lvBase[key] ?? '',
                en: overrides.en[key] ?? enBase[key] ?? '',
                source: { lv: lvBase[key] ?? '', en: enBase[key] ?? '' },
                edited: { lv: Object.hasOwn(overrides.lv, key), en: Object.hasOwn(overrides.en, key) },
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

    /**
     * Proposes new texts for one key. The live text is not touched: each changed language becomes a pending
     * suggestion (replacing an older one for the same key and language). A language left as it is clears its pending one.
     */
    async suggestEntry(adminId: string, input: unknown): Promise<OverrideResult> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

        const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
        const parsed = saveMessageOverrideSchema.safeParse({
            key: raw.key,
            lv: typeof raw.lv === 'string' ? stripMarkers(raw.lv) : raw.lv,
            en: typeof raw.en === 'string' ? stripMarkers(raw.en) : raw.en,
        });
        if (!parsed.success) return { success: false, error: 'MESSAGE_INVALID' };
        const { key } = parsed.data;

        const [lvBase, enBase, overrides] = await Promise.all([loadFlatBase('lv'), loadFlatBase('en'), loadOverrides()]);
        const bases: Record<MessageLang, Record<string, string>> = { lv: lvBase, en: enBase };
        if (!isKnownKey(key, lvBase, enBase)) return { success: false, error: 'MESSAGE_KEY_UNKNOWN' };

        for (const lang of MESSAGE_LANGS) {
            if (validateMessage(parsed.data[lang], bases[lang][key])) return { success: false, error: 'MESSAGE_INVALID' };
        }

        await prisma.$transaction(
            MESSAGE_LANGS.map((lang) => {
                const value = parsed.data[lang];
                const live = overrides[lang][key] ?? bases[lang][key];
                if (value === live) return prisma.messageSuggestion.deleteMany({ where: { key, lang } });
                return prisma.messageSuggestion.upsert({
                    where: { key_lang: { key, lang } },
                    create: { key, lang, value, createdById: adminId },
                    update: { value, createdById: adminId, createdAt: new Date() },
                });
            })
        );
        return { success: true };
    },

    async listSuggestions(adminId: string): Promise<OverrideResult<SuggestionRow[]>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const [lvBase, enBase, overrides, rows] = await Promise.all([
            loadFlatBase('lv'),
            loadFlatBase('en'),
            loadOverrides(),
            prisma.messageSuggestion.findMany({
                orderBy: { createdAt: 'desc' },
                include: { createdBy: { select: { name: true } } },
            }),
        ]);
        const bases: Record<MessageLang, Record<string, string>> = { lv: lvBase, en: enBase };
        const data: SuggestionRow[] = [];
        for (const row of rows) {
            if (row.lang !== 'lv' && row.lang !== 'en') continue;
            data.push({
                id: row.id,
                key: row.key,
                lang: row.lang,
                current: overrides[row.lang][row.key] ?? bases[row.lang][row.key] ?? '',
                value: row.value,
                createdAt: row.createdAt,
                createdBy: row.createdBy?.name ?? null,
            });
        }
        return { success: true, data };
    },

    /**
     * Makes a suggestion the live text (equal to the shipped text removes the override, like a direct save used to).
     * `expectedValue` is the text the admin saw: a suggestion replaced since then (same id, new text) or already
     * approved/rejected by someone else is NOT_FOUND, so nobody approves a text they never read.
     */
    async approveSuggestion(adminId: string, id: string, expectedValue: string): Promise<OverrideResult> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const row = await prisma.messageSuggestion.findUnique({ where: { id } });
        if (!row || row.value !== expectedValue) return { success: false, error: 'NOT_FOUND' };
        if (row.lang !== 'lv' && row.lang !== 'en') return { success: false, error: 'MESSAGE_INVALID' };
        const lang: MessageLang = row.lang;

        const base = await loadFlatBase(lang);
        if (!isKnownKey(row.key, base)) return { success: false, error: 'MESSAGE_KEY_UNKNOWN' };
        if (validateMessage(row.value, base[row.key])) return { success: false, error: 'MESSAGE_INVALID' };

        const { key, value } = row;
        // Claim the suggestion first: only the request that deletes it writes the override (no double approve,
        // no approve after a concurrent reject or replacement).
        const claimed = await prisma.$transaction(async (tx) => {
            const { count } = await tx.messageSuggestion.deleteMany({ where: { id, value } });
            if (count === 0) return false;
            if (value === base[key]) {
                await tx.messageOverride.deleteMany({ where: { key, lang } });
            } else {
                await tx.messageOverride.upsert({
                    where: { key_lang: { key, lang } },
                    create: { key, lang, value, updatedById: adminId },
                    update: { value, updatedById: adminId },
                });
            }
            return true;
        });
        return claimed ? { success: true } : { success: false, error: 'NOT_FOUND' };
    },

    /** Like approve, `expectedValue` keeps a replaced suggestion (same id, new text) from being rejected unseen. */
    async rejectSuggestion(adminId: string, id: string, expectedValue: string): Promise<OverrideResult> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const { count } = await prisma.messageSuggestion.deleteMany({ where: { id, value: expectedValue } });
        return count === 0 ? { success: false, error: 'NOT_FOUND' } : { success: true };
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
