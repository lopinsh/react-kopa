/**
 * Makes one user the site owner (AppRole.OWNER). There is exactly one owner.
 *
 *   npm run set-owner -- you@example.com            fails if another owner exists
 *   npm run set-owner -- you@example.com --force    the old owner becomes ADMIN
 *
 * In production the same file is compiled into the image (see Dockerfile):
 *   docker compose -f docker-compose.server.yml exec app node scripts/set-owner.js you@example.com
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<number> {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const email = args.find((a) => !a.startsWith('--'));
    if (!email) {
        console.error('Usage: set-owner <email> [--force]');
        return 2;
    }

    const user = await prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: 'insensitive' } }, select: { id: true, email: true, role: true } });
    if (!user) {
        console.error(`No user with email ${email}. They must sign in once first.`);
        return 1;
    }

    const others = await prisma.user.findMany({ where: { role: 'OWNER', id: { not: user.id } }, select: { id: true, email: true } });
    if (others.length > 0 && !force) {
        console.error(`Another owner exists (${others.map((o) => o.email ?? o.id).join(', ')}). Use --force to replace them; they become ADMIN.`);
        return 1;
    }

    await prisma.$transaction([
        prisma.user.updateMany({ where: { role: 'OWNER', id: { not: user.id } }, data: { role: 'ADMIN' } }),
        prisma.user.update({ where: { id: user.id }, data: { role: 'OWNER' } }),
    ]);
    console.log(`${user.email} is now the site owner.${others.length > 0 ? ` Previous owner demoted to ADMIN: ${others.map((o) => o.email ?? o.id).join(', ')}.` : ''}`);
    return 0;
}

main()
    .then((code) => { process.exitCode = code; })
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
