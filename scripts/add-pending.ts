import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const group = await prisma.group.findFirst({ where: { slug: 'audit-test-group' } });
    if (!group) {
        console.error('Group not found');
        return;
    }

    // Find a user who is NOT a member
    const user = await prisma.user.findFirst({
        where: {
            NOT: {
                memberships: {
                    some: { groupId: group.id }
                }
            }
        }
    });

    if (!user) {
        console.error('No non-member user found');
        return;
    }

    await prisma.membership.create({
        data: {
            groupId: group.id,
            userId: user.id,
            role: 'PENDING'
        }
    });

    console.log(`Added user ${user.email} as PENDING to group ${group.name}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
