'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createReport(data: {
    targetGroupId?: string;
    targetEventId?: string;
    reason: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'UNAUTHORIZED' };
    }

    try {
        await prisma.report.create({
            data: {
                reporterId: session.user.id,
                targetGroupId: data.targetGroupId,
                targetEventId: data.targetEventId,
                reason: data.reason,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('[createReport] Error:', error);
        return { error: 'REPORT_FAILED' };
    }
}

export async function getReports() {
    const session = await auth();
    // In a real app, verify admin status here. For now, we'll allow any logged-in user to see reports for testing, or assume we have an admin role logic later.
    if (!session?.user?.id) return [];

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

    return rawReports.map(report => {
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
}

export async function resolveReport(reportId: string, resolutionReason: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'UNAUTHORIZED' };

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' }
        });
        return { success: true };
    } catch (error) {
        console.error('[resolveReport] Error:', error);
        return { error: 'RESOLUTION_FAILED' };
    }
}

export async function deleteReportedContent(reportId: string) {
    const session = await auth();
    // Assuming admin role is checked here in a real app
    if (!session?.user?.id) return { error: 'UNAUTHORIZED' };

    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { group: true, event: true }
        });

        if (!report) return { error: 'NOT_FOUND' };

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

        return { success: true };
    } catch (error) {
        console.error('[deleteReportedContent] Error:', error);
        return { error: 'DELETION_FAILED' };
    }
}
