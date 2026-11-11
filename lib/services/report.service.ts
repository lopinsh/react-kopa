import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { originalEventTitle } from '@/lib/translations';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { NOTE_SELECT, noteTopicHref } from './hub-note-row';

const NOTE_TOPIC = NOTE_SELECT.category;

export const ReportService = {
    async createReport(data: {
        reporterId: string;
        targetGroupId?: string;
        targetEventId?: string;
        targetNoteId?: string;
        targetNoteReplyId?: string;
        reason: string;
    }) {
        // Exactly one target: a Ziņa and a reply are reported separately (K-123).
        const targets = [data.targetGroupId, data.targetEventId, data.targetNoteId, data.targetNoteReplyId].filter(Boolean);
        if (targets.length !== 1) throw new ActionError('VALIDATION_FAILED');
        try {
            return await prisma.report.create({
                data: {
                    reporterId: data.reporterId,
                    targetGroupId: data.targetGroupId,
                    targetEventId: data.targetEventId,
                    targetNoteId: data.targetNoteId,
                    targetNoteReplyId: data.targetNoteReplyId,
                    reason: data.reason,
                }
            });
        } catch (error) {
            console.error('[ReportService.createReport] Error:', error);
            throw new ActionError('REPORT_FAILED');
        }
    },

    async getPendingReports() {
        const rawReports = await prisma.report.findMany({
            where: { status: 'PENDING' },
            include: {
                reporter: { select: { id: true, name: true, image: true, avatarSeed: true } },
                group: {
                    select: {
                        id: true, name: true, slug: true,
                        category: { include: { parent: { include: { parent: true } } } }
                    }
                },
                event: { select: { id: true, originalLang: true, translations: { select: { lang: true, title: true } } } },
                note: { select: { id: true, content: true, author: { select: { name: true } }, category: NOTE_TOPIC } },
                noteReply: { select: { id: true, content: true, author: { select: { name: true } }, note: { select: { id: true, category: NOTE_TOPIC } } } },
            },
            orderBy: { createdAt: 'desc' }
        });

        return rawReports.map((report) => {
            const l1Slug = report.group ? TaxonomyResolver.resolve(report.group.category).l1Slug : '';

            return {
                ...report,
                // The admin sees the event title as the organiser wrote it.
                event: report.event
                    ? { id: report.event.id, title: originalEventTitle(report.event.translations, report.event.originalLang) }
                    : null,
                // A reported Ziņa or reply: its text, who wrote it and the hub's Ziņas page.
                note: report.note ? { id: report.note.id, content: report.note.content, authorName: report.note.author.name, href: noteTopicHref(report.note.category) } : null,
                noteReply: report.noteReply ? { id: report.noteReply.id, content: report.noteReply.content, authorName: report.noteReply.author.name, href: noteTopicHref(report.noteReply.note.category) } : null,
                group: report.group ? {
                    id: report.group.id,
                    name: report.group.name,
                    slug: report.group.slug,
                    l1Slug
                } : null
            };
        });
    },

    async resolveReport(reportId: string) {
        try {
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'RESOLVED' }
            });
            return true;
        } catch (error) {
            console.error('[ReportService.resolveReport] Error:', error);
            throw new ActionError('RESOLUTION_FAILED');
        }
    },

    async deleteReportedContent(reportId: string) {
        try {
            const report = await prisma.report.findUnique({
                where: { id: reportId },
                select: { targetGroupId: true, targetEventId: true, targetNoteId: true, targetNoteReplyId: true }
            });

            if (!report) {
                throw new ActionError('NOT_FOUND');
            }

            // A reported Ziņa or reply is hard deleted; its reports go with it (cascade).
            if (report.targetNoteId || report.targetNoteReplyId) {
                if (report.targetNoteId) await prisma.hubNote.delete({ where: { id: report.targetNoteId } });
                else if (report.targetNoteReplyId) await prisma.hubNoteReply.delete({ where: { id: report.targetNoteReplyId } });
                return true;
            }

            // Only reported events are deleted from here. Groups are never deleted from a report:
            // hide first (AdminService.suspendReportedGroup), delete from the hidden list.
            const eventId = report.targetEventId;
            if (!eventId) {
                throw new ActionError('VALIDATION_FAILED');
            }

            // We use a transaction to ensure both the entity deletion and report resolution succeed
            await prisma.$transaction(async (tx) => {
                await tx.event.delete({ where: { id: eventId } });

                await tx.report.update({
                    where: { id: reportId },
                    data: { status: 'RESOLVED' }
                });
            });

            return true;
        } catch (error: unknown) {
            if (error instanceof ActionError) throw error;
            console.error('[ReportService.deleteReportedContent] Error:', error);
            throw new ActionError('DELETE_FAILED');
        }
    }
};
