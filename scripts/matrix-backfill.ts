/**
 * Makes every Čats room that should exist (K5-1): the hub rooms of ACTIVE L2/L3 and the rooms of OPEN topic x city hubs,
 * then site-admin power levels. Idempotent: a second run creates nothing.
 *
 *   npm run matrix:backfill        (needs MATRIX_* in .env)
 */
import { ChatRoomService } from '../lib/services/chat-room.service';
import { prisma } from '../lib/prisma';

async function main(): Promise<number> {
    const { created, existing } = await ChatRoomService.ensureAll();
    const synced = await ChatRoomService.syncAllPowerLevels();
    console.log(`rooms created ${created}, already there ${existing}, power levels synced in ${synced}`);
    return 0;
}

main()
    .then((code) => prisma.$disconnect().then(() => process.exit(code)))
    .catch((e: unknown) => {
        console.error(e);
        process.exit(1);
    });
