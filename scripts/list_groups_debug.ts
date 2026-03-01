import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.group.findMany({
        take: 5,
        select: {
            slug: true,
            category: {
                select: {
                    slug: true
                }
            }
        }
    });
    console.log(JSON.stringify(groups, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
