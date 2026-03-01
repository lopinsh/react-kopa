
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGroup() {
    const group = await prisma.group.findFirst({
        where: { slug: 'pargajieni' },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!group) {
        console.log('Group not found');
        return;
    }

    console.log(`Group: ${group.name} (${group.id})`);
    console.log(`Discord Link: ${group.discordLink}`);
    console.log('Members:');
    group.members.forEach(m => {
        console.log(`- ${m.user.email} (${m.role})`);
    });
}

checkGroup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
