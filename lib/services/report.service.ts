import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';

export const ReportService = {
    async createReport(data: {
        reporterId: string;
        targetGroupId?: string;
        targetEventId?: string;
        reason: string;
    }) {
        try {
            return await prisma.report.create({
                data: {
                    reporterId: data.reporterId,
                    targetGroupId: data.targetGroupId,
                    targetEventId: data.targetEventId,
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
                reporter: { select: { id: true, name: true, image: true } },
                group: {
                    select: {
                        id: true, name: true, slug: true,
                        category: { include: { parent: { include: { parent: true } } } }
                    }
                },
                event: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return rawReports.map((report) => {
            let l1Slug = '';
            if (report.group?.category) {
                l1Slug = report.group.category.parent?.parent?.slug
                    || report.group.category.parent?.slug
                    || report.group.category.slug;
            }

            return {
                ...report,
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
                include: { group: true, event: true }
            });

            if (!report) {
                throw new ActionError('NOT_FOUND');
            }

            // We use a transaction to ensure both the entity deletion and report resolution succeed
            await prisma.$transaction(async (tx) => {
                if (report.targetGroupId) {
                    await tx.group.delete({ where: { id: report.targetGroupId } });
                } else if (report.targetEventId) {
                    await tx.event.delete({ where: { id: report.targetEventId } });
                }

                await tx.report.update({
                    where: { id: reportId },
                    data: { status: 'RESOLVED' }
                });
            });

            return true;
        } catch (error: any) {
            if (error.name === 'ActionError') throw error;
            console.error('[ReportService.deleteReportedContent] Error:', error);
            throw new ActionError('DELETE_FAILED');
        }
    }
};
