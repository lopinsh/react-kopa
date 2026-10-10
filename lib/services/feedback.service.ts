import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ErrorCode } from '@/types/actions';
import type { FeedbackKindValue, FeedbackStatusValue } from '@/lib/constants';
import { createFeedbackSchema, updateFeedbackSchema, type FeedbackFilter } from '@/lib/validations/feedback';
import { isSiteAdmin } from './moderation.service';

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
    userAgent: string;
    reply: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    authorName: string | null;
}

export type FeedbackResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

const itemArgs = { include: { author: { select: { name: true, username: true } } } } satisfies Prisma.FeedbackDefaultArgs;

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
        userAgent: row.userAgent,
        reply: row.reply,
        resolvedAt: row.resolvedAt,
        createdAt: row.createdAt,
        authorName: row.author.username ?? row.author.name,
    };
}

/** Moving a note to DONE or WONT_DO stamps the time; reopening clears it. */
function resolvedAtFor(status: FeedbackStatusValue): Date | null {
    return status === 'DONE' || status === 'WONT_DO' ? new Date() : null;
}

async function updateNote(id: string, input: unknown): Promise<FeedbackResult<FeedbackItem>> {
    const parsed = updateFeedbackSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    const existing = await prisma.feedback.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return { success: false, error: 'NOT_FOUND' };

    const row = await prisma.feedback.update({
        where: { id },
        data: {
            status: parsed.data.status,
            reply: parsed.data.reply === undefined ? undefined : parsed.data.reply || null,
            // Only a status change moves the time; editing just the reply keeps when it was resolved.
            resolvedAt: existing.status === parsed.data.status ? undefined : resolvedAtFor(parsed.data.status),
        },
        ...itemArgs,
    });
    return { success: true, data: toItem(row) };
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
        return updateNote(id, input);
    },

    /** Agent access (API token): there is no user, so the caller must already have checked the token. */
    async listForAgent(status?: FeedbackStatusValue): Promise<FeedbackItem[]> {
        const rows = await prisma.feedback.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, take: 200, ...itemArgs });
        return rows.map(toItem);
    },

    updateForAgent: updateNote,
};
