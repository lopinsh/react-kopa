import { prisma } from './lib/prisma';

async function run() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'owner@local' }
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        const membership = await prisma.membership.findFirst({
            where: {
                userId: user.id,
                role: 'OWNER'
            },
            include: {
                group: {
                    include: {
                        category: true
                    }
                }
            }
        });

        if (membership) {
            console.log(JSON.stringify({
                slug: membership.group.slug,
                categorySlug: membership.group.category.slug
            }));
        } else {
            console.log('No group found for this owner');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
