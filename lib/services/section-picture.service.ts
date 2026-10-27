import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { MAX_SECTION_PICTURES } from '@/lib/constants';
import { assertPictureUrlAllowed, bannerCreditColumns } from '@/lib/banner';
import { isSiteAdmin as isSiteAdminRole } from '@/lib/site-role';
import type { SectionPicturePick } from '@/lib/validations/section-picture';
import { GroupService } from './group.service';
import { ModerationService } from './moderation.service';
import { getSiteRole } from './site-role.service';

/** Manager check for the group that owns the content: FORBIDDEN unless allowed. */
async function requireManager(groupId: string, userId: string): Promise<{ bySiteAdminOnly: boolean }> {
    const access = await GroupService.getManagerAccess(groupId, userId);
    if (!access.allowed) throw new ActionError('FORBIDDEN');
    return { bySiteAdminOnly: access.bySiteAdminOnly };
}

/** After a successful write: logs a site admin's edit (invariant 10), returns the slugs for revalidation. */
async function finish(groupId: string, userId: string, bySiteAdminOnly: boolean): Promise<{ slug: string; l1Slug: string }> {
    if (bySiteAdminOnly) await ModerationService.logAction(userId, 'GROUP_EDIT', 'GROUP', groupId);
    const slugs = await GroupService.getGroupSlugs(groupId);
    if (!slugs) throw new ActionError('NOT_FOUND');
    return slugs;
}

export const SectionPictureService = {
    /** Adds one picture at the end of a section (at most MAX_SECTION_PICTURES, also under concurrent adds). */
    async add(
        groupId: string,
        sectionId: string,
        pick: SectionPicturePick,
        userId: string,
    ): Promise<{ pictureId: string; sectionId: string; slug: string; l1Slug: string }> {
        const { bySiteAdminOnly } = await requireManager(groupId, userId);
        assertPictureUrlAllowed(pick.url, isSiteAdminRole(await getSiteRole(userId)));

        const realSectionId = sectionId === 'about' ? await GroupService.ensureFirstSection(groupId) : sectionId;
        const credit = bannerCreditColumns(pick.url, pick.credit);

        const pictureId = await prisma.$transaction(async (tx) => {
            // The lock serialises adds to one section, so the count below cannot go stale (READ COMMITTED).
            const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "GroupSection" WHERE id = ${realSectionId} AND "groupId" = ${groupId} FOR UPDATE`;
            if (locked.length === 0) throw new ActionError('SECTION_NOT_FOUND');
            const count = await tx.groupSectionPicture.count({ where: { sectionId: realSectionId } });
            if (count >= MAX_SECTION_PICTURES) throw new ActionError('SECTION_PICTURE_LIMIT');
            const last = await tx.groupSectionPicture.aggregate({ where: { sectionId: realSectionId }, _max: { order: true } });
            const created = await tx.groupSectionPicture.create({
                data: {
                    sectionId: realSectionId,
                    order: (last._max.order ?? -1) + 1,
                    url: pick.url,
                    creditName: credit.bannerCreditName,
                    creditUser: credit.bannerCreditUser,
                },
                select: { id: true },
            });
            return created.id;
        });

        return { pictureId, sectionId: realSectionId, ...(await finish(groupId, userId, bySiteAdminOnly)) };
    },

    /** Removes one picture; the rest keep their order (gaps are fine, reads sort by `order`). */
    async remove(pictureId: string, userId: string): Promise<{ slug: string; l1Slug: string }> {
        const picture = await prisma.groupSectionPicture.findUnique({
            where: { id: pictureId },
            select: { section: { select: { groupId: true } } },
        });
        if (!picture) throw new ActionError('NOT_FOUND');
        const groupId = picture.section.groupId;
        const { bySiteAdminOnly } = await requireManager(groupId, userId);
        await prisma.groupSectionPicture.deleteMany({ where: { id: pictureId } });
        return finish(groupId, userId, bySiteAdminOnly);
    },

    /** Sets the order of a section's pictures; `ids` must be exactly the section's pictures. */
    async reorder(sectionId: string, ids: string[], userId: string): Promise<{ slug: string; l1Slug: string }> {
        const section = await prisma.groupSection.findUnique({ where: { id: sectionId }, select: { groupId: true } });
        if (!section) throw new ActionError('SECTION_NOT_FOUND');
        const { bySiteAdminOnly } = await requireManager(section.groupId, userId);

        await prisma.$transaction(async (tx) => {
            const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "GroupSection" WHERE id = ${sectionId} AND "groupId" = ${section.groupId} FOR UPDATE`;
            if (locked.length === 0) throw new ActionError('SECTION_NOT_FOUND');
            const current = await tx.groupSectionPicture.findMany({ where: { sectionId }, select: { id: true } });
            const known = new Set(current.map((p) => p.id));
            if (ids.length !== current.length || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
                throw new ActionError('VALIDATION_FAILED');
            }
            for (const [index, id] of ids.entries()) {
                await tx.groupSectionPicture.updateMany({ where: { id, sectionId }, data: { order: index } });
            }
        });

        return finish(section.groupId, userId, bySiteAdminOnly);
    },
};
