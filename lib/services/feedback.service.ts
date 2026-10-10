import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ErrorCode } from '@/types/actions';
import type { FeedbackKindValue, FeedbackStatusValue } from '@/lib/constants';
import { createFeedbackSchema, updateFeedbackSchema, replyFeedbackSchema, type FeedbackFilter } from '@/lib/validations/feedback';
import { isSiteAdmin } from './moderation.service';

export interface FeedbackReplyItem {
    id: string;
    text: string;
    /** True when the reply came through the API token / CLI rather than a signed-in admin. */
    byAgent: boolean;
    authorName: string | null;
    createdAt: Date;
}

export interface FeedbackItem {
    id: string;
    kind: FeedbackKindValue;
    status: FeedbackStatusValue;
    text: string;
    path: string;
    locale: string;
    viewportW: number;
    viewportH: number;
    theme: string;
    selector: string;
    elementText: string;
    component: string | null;
    breadcrumb: string | null;
    outerHtml: string | null;
    commit: string | null;
    heading: string | null;
    /** Element box in page pixels (from the top-left of the document) when the note was made. */
    box: { x: number; y: number; w: number; h: number } | null;
    userAgent: string;
    /** The thread under the original text, oldest first. The original `text` is never edited. */
    replies: FeedbackReplyItem[];
    resolvedAt: Date | null;
    createdAt: Date;
    authorName: string | null;
}

export type FeedbackResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

const itemArgs = {
    include: {
        author: { select: { name: true, username: true } },
        replies: { orderBy: { createdAt: 'asc' }, include: { author: { select: { name: true, username: true } } } },
    },
} satisfies Prisma.FeedbackDefaultArgs;

function toItem(row: Prisma.FeedbackGetPayload<typeof itemArgs>): FeedbackItem {
    return {
        id: row.id,
        kind: row.kind,
        status: row.status,
        text: row.text,
        path: row.path,
        locale: row.locale,
        viewportW: row.viewportW,
        viewportH: row.viewportH,
        theme: row.theme,
        selector: row.selector,
        elementText: row.elementText,
        component: row.component,
        breadcrumb: row.breadcrumb,
        outerHtml: row.outerHtml,
        commit: row.commit,
        heading: row.heading,
        box: row.boxX !== null && row.boxY !== null && row.boxW !== null && row.boxH !== null
            ? { x: row.boxX, y: row.boxY, w: row.boxW, h: row.boxH }
            : null,
        userAgent: row.userAgent,
        replies: row.replies.map((r) => ({
            id: r.id,
            text: r.text,
            byAgent: r.byAgent,
            authorName: r.author ? r.author.username ?? r.author.name : null,
            createdAt: r.createdAt,
        })),
        resolvedAt: row.resolvedAt,
        createdAt: row.createdAt,
        authorName: row.author.username ?? row.author.name,
    };
}

/** Moving a note to DONE or WONT_DO stamps the time; reopening clears it. */
function resolvedAtFor(status: FeedbackStatusValue): Date | null {
    return status === 'DONE' || status === 'WONT_DO' ? new Date() : null;
}

/** Status change; a non-empty `reply` is appended to the thread (never replaces anything). `authorId` null means the agent. */
async function updateNote(id: string, authorId: string | null, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
    const parsed = updateFeedbackSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    const existing = await prisma.feedback.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { success: false, error: 'NOT_FOUND' };

    const row = await prisma.feedback.update({
        where: { id },
        data: {
            status: parsed.data.status,
            // Only a status change moves the time; a reply alone keeps when it was resolved.
            resolvedAt: existing.status === parsed.data.status ? undefined : resolvedAtFor(parsed.data.status),
            replies: parsed.data.reply ? { create: { text: parsed.data.reply, authorId, byAgent: authorId === null } } : undefined,
        },
        ...itemArgs,
    });
    return { success: true, data: toItem(row) };
}

async function addReply(id: string, authorId: string | null, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
    const parsed = replyFeedbackSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    const existing = await prisma.feedback.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return { success: false, error: 'NOT_FOUND' };
    const row = await prisma.feedback.update({
        where: { id },
        data: { replies: { create: { text: parsed.data.text, authorId, byAgent: authorId === null } } },
        ...itemArgs,
    });
    return { success: true, data: toItem(row) };
}

/** Hard delete. `deleteMany` so a note that is already gone is NOT_FOUND instead of a thrown error. */
async function deleteNote(id: string): Promise<FeedbackResult> {
    const { count } = await prisma.feedback.deleteMany({ where: { id } });
    return count === 0 ? { success: false, error: 'NOT_FOUND' } : { success: true };
}

export const FeedbackService = {
    async create(adminId: string, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        const parsed = createFeedbackSchema.safeParse(input);
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

        const row = await prisma.feedback.create({ data: { ...parsed.data, authorId: adminId }, ...itemArgs });
        return { success: true, data: toItem(row) };
    },

    /** Notes for one page. A path without a query also matches the same page with any query. */
    async listForPath(adminId: string, path: string): Promise<FeedbackResult<FeedbackItem[]>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        const rows = await prisma.feedback.findMany({
            where: { OR: [{ path }, { path: { startsWith: `${path}?` } }] },
            orderBy: { createdAt: 'asc' },
            ...itemArgs,
        });
        return { success: true, data: rows.map(toItem) };
    },

    async list(adminId: string, filter: FeedbackFilter): Promise<FeedbackResult<FeedbackItem[]>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        const rows = await prisma.feedback.findMany({
            where: {
                kind: filter.kind,
                status: filter.status,
                path: filter.page ? { contains: filter.page, mode: 'insensitive' } : undefined,
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            ...itemArgs,
        });
        return { success: true, data: rows.map(toItem) };
    },

    async update(adminId: string, id: string, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        return updateNote(id, adminId, input);
    },

    async remove(adminId: string, id: string): Promise<FeedbackResult> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        return deleteNote(id);
    },

    /** Agent access (API token): there is no user, so the caller must already have checked the token. */
    async listForAgent(status?: FeedbackStatusValue): Promise<FeedbackItem[]> {
        const rows = await prisma.feedback.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, take: 200, ...itemArgs });
        return rows.map(toItem);
    },

    async reply(adminId: string, id: string, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'FORBIDDEN' };
        return addReply(id, adminId, input);
    },

    updateForAgent: (id: string, input: unknown) => updateNote(id, null, input),
    removeForAgent: deleteNote,
};
