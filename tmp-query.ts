import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();
async function main() {
    const groups = await prisma.group.findMany({
        select: { name: true, slug: true, accentColor: true }
    });
    fs.writeFileSync('tmp-groups.json', JSON.stringify(groups, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
