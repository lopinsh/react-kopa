import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type Db = Prisma.TransactionClient | typeof prisma;

/** The DIRECT chat of exactly these two people, if one exists (any state). */
export async function findPairChat(db: Db, userId: string, otherUserId: string): Promise<{ id: string } | undefined> {
    const candidates = await db.conversation.findMany({
        where: {
            kind: 'DIRECT',
            AND: [{ participants: { some: { id: userId } } }, { participants: { some: { id: otherUserId } } }],
        },
        select: { id: true, _count: { select: { participants: true } } },
    });
    return candidates.find((c) => c._count.participants === 2);
}

/**
 * Two people opening a chat at the same moment must end up with one: serialize per pair (lock released at commit), look again
 * before creating. Runs `inside` in the same transaction with the chat's id (the chat request posts its first message there).
 */
export async function ensurePairChat(userId: string, otherUserId: string, inside?: (tx: Prisma.TransactionClient, chatId: string) => Promise<void>): Promise<{ id: string; created: boolean }> {
    const pairKey = [userId, otherUserId].sort().join(':');
    return prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${pairKey}))`;
        const raced = await findPairChat(tx, userId, otherUserId);
        const chat = raced
            ? { id: raced.id, created: false }
            : { id: (await tx.conversation.create({ data: { kind: 'DIRECT', participants: { connect: [{ id: userId }, { id: otherUserId }] } }, select: { id: true } })).id, created: true };
        if (inside) await inside(tx, chat.id);
        return chat;
    });
}
