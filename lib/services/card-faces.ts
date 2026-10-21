import { prisma } from '@/lib/prisma';
import { FACES_MAX } from '@/lib/constants';
import { toFace, type Face } from './event-panel';

interface FaceRow { groupId: string; id: string; name: string | null; username: string | null; image: string | null; avatarSeed: string | null }

/**
 * Group id → up to FACES_MAX members with a public profile, for the faces on a group card. Signed-out viewers get none (the same
 * rule as the event panel). One query for all the listed groups (a window function caps each group at FACES_MAX), none per card.
 */
export async function cardFaces(groupIds: string[], viewerId?: string): Promise<Record<string, Face[]>> {
    if (!viewerId || groupIds.length === 0) return {};
    const rows = await prisma.$queryRaw<FaceRow[]>`
        SELECT r."groupId", u."id", u."name", u."username", u."image", u."avatarSeed"
        FROM (
            SELECT m."groupId", m."userId",
                   ROW_NUMBER() OVER (PARTITION BY m."groupId" ORDER BY m."joinedAt" ASC) AS rn
            FROM "Membership" m
            JOIN "User" pu ON pu."id" = m."userId"
            WHERE m."groupId" = ANY(${groupIds}) AND m."role" <> 'PENDING' AND pu."isProfilePublic" = true
        ) r
        JOIN "User" u ON u."id" = r."userId"
        WHERE r.rn <= ${FACES_MAX}
        ORDER BY r."groupId", r.rn`;
    const result: Record<string, Face[]> = {};
    for (const row of rows) (result[row.groupId] ??= []).push(toFace(row));
    return result;
}
