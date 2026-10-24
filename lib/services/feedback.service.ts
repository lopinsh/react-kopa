import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { FEEDBACK_TAB_STATUSES, type FeedbackKindValue, type FeedbackStatusValue, type FeedbackTab } from '@/lib/constants';
import { createFeedbackSchema, updateFeedbackSchema, replyFeedbackSchema, type FeedbackFilter } from '@/lib/validations/feedback';
import { isSiteAdminUser } from './site-role.service';

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
async function updateNote(id: string, authorId: string | null, input: unknown): Promise<FeedbackItem> {
    const parsed = updateFeedbackSchema.safeParse(input);
    if (!parsed.success) throw new ActionError('VALIDATION_FAILED');
    const existing = await prisma.feedback.findUnique({ where: { id }, select: { status: true } });
    if (!existing) throw new ActionError('NOT_FOUND');

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
    return toItem(row);
}

async function addReply(id: string, authorId: string | null, input: unknown): Promise<FeedbackItem> {
    const parsed = replyFeedbackSchema.safeParse(input);
    if (!parsed.success) throw new ActionError('VALIDATION_FAILED');
    const existing = await prisma.feedback.findUnique({ where: { id }, select: { status: true } });
    if (!existing) throw new ActionError('NOT_FOUND');
    // An admin answering a closed note means it needs action again; the agent's own reply never reopens.
    const reopen = authorId !== null && (existing.status === 'DONE' || existing.status === 'WONT_DO');
    const row = await prisma.feedback.update({
        where: { id },
        data: {
            ...(reopen ? { status: 'OPEN' as const, resolvedAt: null } : {}),
            replies: { create: { text: parsed.data.text, authorId, byAgent: authorId === null } },
        },
        ...itemArgs,
    });
    return toItem(row);
}

/** Hard delete. `deleteMany` so a note that is already gone is NOT_FOUND instead of a thrown error. */
async function deleteNote(id: string): Promise<void> {
    const { count } = await prisma.feedback.deleteMany({ where: { id } });
    if (count === 0) throw new ActionError('NOT_FOUND');
}

export const FeedbackService = {
    async create(adminId: string, input: unknown): Promise<FeedbackItem> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const parsed = createFeedbackSchema.safeParse(input);
        if (!parsed.success) throw new ActionError('VALIDATION_FAILED');

        const row = await prisma.feedback.create({ data: { ...parsed.data, authorId: adminId }, ...itemArgs });
        return toItem(row);
    },

    /** Notes for one page. A path without a query also matches the same page with any query. */
    async listForPath(adminId: string, path: string): Promise<FeedbackItem[]> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const rows = await prisma.feedback.findMany({
            where: { OR: [{ path }, { path: { startsWith: `${path}?` } }] },
            orderBy: { createdAt: 'asc' },
            ...itemArgs,
        });
        return rows.map(toItem);
    },

    /** Open notes per page path (query stripped, so `/x?a=1` and `/x` count together), most first. */
    async openCountsByPath(adminId: string): Promise<{ path: string; count: number }[]> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const groups = await prisma.feedback.groupBy({
            by: ['path'],
            where: { status: { in: [...FEEDBACK_TAB_STATUSES.open] } },
            _count: { _all: true },
        });
        const merged = new Map<string, number>();
        for (const g of groups) {
            const path = g.path.split('?')[0] || '/';
            merged.set(path, (merged.get(path) ?? 0) + g._count._all);
        }
        return [...merged].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
    },

    async list(adminId: string, filter: FeedbackFilter): Promise<FeedbackItem[]> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const rows = await prisma.feedback.findMany({
            where: {
                kind: filter.kind,
                status: { in: [...FEEDBACK_TAB_STATUSES[filter.tab ?? 'open']] },
                path: filter.page ? { contains: filter.page, mode: 'insensitive' } : undefined,
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
            ...itemArgs,
        });
        return rows.map(toItem);
    },

    /** Note counts per tab (ignores the kind/page filters, so the tab labels stay stable). */
    async counts(adminId: string): Promise<Record<FeedbackTab, number>> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const [open, completed] = await Promise.all([
            prisma.feedback.count({ where: { status: { in: [...FEEDBACK_TAB_STATUSES.open] } } }),
            prisma.feedback.count({ where: { status: { in: [...FEEDBACK_TAB_STATUSES.completed] } } }),
        ]);
        return { open, completed };
    },

    /** Deletes every DONE / WONT_DO note (replies cascade) and returns how many went. Open notes are untouched. */
    async purgeClosed(adminId: string): Promise<{ count: number }> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const { count } = await prisma.feedback.deleteMany({ where: { status: { in: [...FEEDBACK_TAB_STATUSES.completed] } } });
        return { count };
    },

    async update(adminId: string, id: string, input: unknown): Promise<FeedbackItem> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        return updateNote(id, adminId, input);
    },

    async remove(adminId: string, id: string): Promise<void> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        return deleteNote(id);
    },

    /** Agent access (API token): there is no user, so the caller must already have checked the token. */
    async listForAgent(status?: FeedbackStatusValue): Promise<FeedbackItem[]> {
        const rows = await prisma.feedback.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, take: 200, ...itemArgs });
        return rows.map(toItem);
    },

    async reply(adminId: string, id: string, input: unknown): Promise<FeedbackItem> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        return addReply(id, adminId, input);
    },

    updateForAgent: (id: string, input: unknown) => updateNote(id, null, input),
    removeForAgent: deleteNote,
};
