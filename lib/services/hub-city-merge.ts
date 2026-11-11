import type { HubCityStatus, Prisma } from '@prisma/client';

const RANK: Record<HubCityStatus, number> = { CLOSED: 0, REQUESTED: 1, OPEN: 2 };

/**
 * Tag merges (K3-14): topic x city hubs of the merged Veidi move to the canonical one inside the merge's transaction.
 * When both Veidi already have a hub for the city, the more advanced one stays (OPEN > REQUESTED > CLOSED), the other's
 * requests join it (a person already there is skipped) and the other row is deleted.
 */
export async function moveHubCities(tx: Prisma.TransactionClient, fromIds: string[], toId: string): Promise<void> {
    const sources = await tx.hubCity.findMany({ where: { categoryId: { in: fromIds } }, include: { requests: true } });
    for (const source of sources) {
        const target = await tx.hubCity.findUnique({
            where: { categoryId_cityId: { categoryId: toId, cityId: source.cityId } },
            include: { requests: { select: { userId: true } } },
        });
        if (!target) {
            await tx.hubCity.update({ where: { id: source.id }, data: { categoryId: toId } });
            continue;
        }
        const known = new Set(target.requests.map((r) => r.userId));
        for (const r of source.requests) {
            if (!known.has(r.userId)) {
                known.add(r.userId);
                await tx.hubCityRequest.update({ where: { id: r.id }, data: { hubCityId: target.id } });
            }
        }
        if (RANK[source.status] > RANK[target.status]) {
            await tx.hubCity.update({
                where: { id: target.id },
                data: { status: source.status, openedAt: source.openedAt, closedAt: source.closedAt, closedById: source.closedById },
            });
        }
        await tx.hubCity.delete({ where: { id: source.id } });
    }
}
